"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { IAddress, ICart, ICity, ICountry, ICounty, IVoucher } from "@/types";
import {
  fetchCitiesByCounty,
  fetchCountiesByCountry,
  placeOrder,
  validateVoucher,
} from "@/lib/data";

/**
 * Formats a numeric price into a localized currency string.
 * @param {number} price - The price to format.
 * @returns {string} The formatted currency string (e.g., "Ksh 1,234.56").
 */
// TODO: Relocate this helper to a shared `utils/formatters.ts` file for application-wide reusability.
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

/**
 * Defines the expected shape of the user session object, typically from an
 * authentication provider like NextAuth.js.
 */
type UserSession = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
};

/**
 * Defines the props required by the CheckoutClient component.
 */
interface CheckoutClientProps {
  /**
   * The current authenticated user's session data.
   */
  user: UserSession;
  /**
   * The user's active shopping cart.
   */
  cart: ICart;
  /**
   * A list of the user's saved addresses.
   */
  addresses: IAddress[];
  /**
   * A list of all available countries for shipping.
   */
  countries: ICountry[];
}

/**
 * A client component that manages the entire checkout process, including
 * delivery details, payment method selection, and order summary calculation.
 * It handles form state, dynamic data fetching for locations, and final order submission.
 *
 * @param {CheckoutClientProps} props - The initial data required for the component.
 */
export const CheckoutClient = ({
  user,
  cart,
  addresses,
  countries,
}: CheckoutClientProps) => {
  const router = useRouter();

  // State for the user-inputted shipping information.
  const [shippingDetails, setShippingDetails] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: "",
  });

  // State to track the selected saved address and payment method.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // State for managing the submission process to prevent double-clicks and provide UI feedback.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the dynamic, cascading location dropdowns.
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCountyId, setSelectedCountyId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [counties, setCounties] = useState<ICounty[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoadingCounties, setIsLoadingCounties] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // State for voucher management
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<IVoucher | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  /**
   * A side effect that runs on initial load to pre-fill the form with the user's
   * default address, enhancing the user experience.
   */
  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddress) {
      handleAddressSelect(defaultAddress);
    }
  }, [addresses]);

  /**
   * A generic handler for updating controlled input fields in the shipping details form.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingDetails({ ...shippingDetails, [e.target.id]: e.target.value });
  };

  /**
   * Populates the form fields when a user selects a saved address.
   * @param {IAddress} address - The selected address object.
   */
  const handleAddressSelect = (address: IAddress) => {
    setSelectedAddressId(address._id.toString());
    setShippingDetails({
      name: address.recipientName,
      email: user.email ?? "", // Keep the current user's email.
      phone: address.phone,
    });
    // Pre-select the country and trigger the cascade to load relevant counties.
    const countryId = address.country._id.toString();
    setSelectedCountryId(countryId);
    // Reset subsequent location fields to force re-selection.
    // TODO: A more advanced implementation could attempt to pre-select the county and city as well.
    setSelectedCountyId("");
    setSelectedCityId("");
    setCounties([]);
    setCities([]);
    if (countryId) onCountryChange(countryId);
  };

  /**
   * Fetches counties based on the selected country and updates the state.
   * @param {string} countryId - The ID of the selected country.
   */
  const onCountryChange = async (countryId: string) => {
    setSelectedCountryId(countryId);
    setSelectedCountyId("");
    setSelectedCityId("");
    setCounties([]);
    setCities([]);
    setIsLoadingCounties(true);
    try {
      const fetchedCounties = await fetchCountiesByCountry(countryId);
      setCounties(fetchedCounties);
    } catch (error) {
      toast.error("Error", { description: "Failed to fetch counties." });
    } finally {
      setIsLoadingCounties(false);
    }
  };

  /**
   * Fetches cities based on the selected county and updates the state.
   * @param {string} countyId - The ID of the selected county.
   */
  const onCountyChange = async (countyId: string) => {
    setSelectedCountyId(countyId);
    setSelectedCityId("");
    setCities([]);
    setIsLoadingCities(true);
    try {
      const fetchedCities = await fetchCitiesByCounty(countyId);
      setCities(fetchedCities);
    } catch (error) {
      toast.error("Error", { description: "Failed to fetch cities." });
    } finally {
      setIsLoadingCities(false);
    }
  };

  /**
   * Memoized calculation of the order summary. This prevents re-computation on every
   * render, only updating when relevant dependencies (cart, city, voucher) change.
   */
  const orderSummary = useMemo(() => {
    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee =
      cities.find((c) => c._id.toString() === selectedCityId)?.deliveryFee ?? 0;
    const tax = subtotal * 0.16; // Example 16% VAT.

    let discount = 0;
    if (appliedVoucher) {
      if (appliedVoucher.discountType === "percentage") {
        discount = subtotal * (appliedVoucher.discountValue / 100);
      } else if (appliedVoucher.discountType === "fixed") {
        discount = appliedVoucher.discountValue;
      }
    }

    const total = Math.max(0, subtotal + shippingFee + tax - discount);

    return { subtotal, shippingFee, tax, discount, total };
  }, [cart, cities, selectedCityId, appliedVoucher]);

  /**
   * Attempts to validate and apply a voucher code.
   */
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.warning("Please enter a voucher code.");
      return;
    }
    setIsApplyingVoucher(true);
    try {
      const validVoucher = await validateVoucher(voucherCode);
      setAppliedVoucher(validVoucher);
      toast.success("Voucher applied successfully!");
    } catch (error: any) {
      setAppliedVoucher(null); // Clear any previously applied voucher on failure
      toast.error("Invalid Voucher", { description: error.message });
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  /**
   * Removes an applied voucher and resets the input.
   */
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast.info("Voucher removed.");
  };

  /**
   * Handles the final order submission. It validates input, constructs the payload,
   * calls the API, and redirects the user on success.
   */
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) {
      toast.warning("Validation Error", {
        description: "Please select a delivery city before placing the order.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const fullAddress = `${shippingDetails.name}, ${
        cities.find((c) => c._id.toString() === selectedCityId)?.name
      }, ${counties.find((c) => c._id.toString() === selectedCountyId)?.name}`;

      const newOrder = await placeOrder({
        shippingDetails: { ...shippingDetails, address: fullAddress },
        paymentMethod,
        cityId: selectedCityId,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      });

      router.push(`/success?orderId=${newOrder.orderId}`);
    } catch (error: any) {
      toast.error("Order Failed", {
        description:
          error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-background py-8 md:py-16">
      <form
        onSubmit={handlePlaceOrder}
        className="mx-auto max-w-screen-xl px-4 2xl:px-0"
      >
        <div className="lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-8">
            {/* Delivery Details Section */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Use a saved address</Label>
                    <RadioGroup
                      onValueChange={(id) =>
                        handleAddressSelect(
                          addresses.find((a) => a._id.toString() === id)!
                        )
                      }
                      value={selectedAddressId ?? ""}
                    >
                      {addresses.map((addr) => (
                        <Label
                          key={addr._id.toString()}
                          htmlFor={addr._id.toString()}
                          className="flex cursor-pointer items-center space-x-2 rounded-md border p-3 has-[[data-state=checked]]:border-primary"
                        >
                          <RadioGroupItem
                            value={addr._id.toString()}
                            id={addr._id.toString()}
                          />
                          <span>
                            {addr.recipientName} - {addr.streetAddress},{" "}
                            {(addr.city as ICity)?.name || ""}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                    <Separator className="my-4" />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name*</Label>
                    <Input
                      id="name"
                      value={shippingDetails.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Your email*</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingDetails.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number*</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingDetails.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country*</Label>
                    <Select
                      onValueChange={onCountryChange}
                      value={selectedCountryId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem
                            key={c._id.toString()}
                            value={c._id.toString()}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County*</Label>
                    <Select
                      onValueChange={onCountyChange}
                      value={selectedCountyId}
                      disabled={!selectedCountryId || isLoadingCounties}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCounties ? "Loading..." : "Select County"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map((c) => (
                          <SelectItem
                            key={c._id.toString()}
                            value={c._id.toString()}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City*</Label>
                    <Select
                      onValueChange={setSelectedCityId}
                      value={selectedCityId}
                      disabled={!selectedCountyId || isLoadingCities}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingCities ? "Loading..." : "Select City"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem
                            key={c._id.toString()}
                            value={c._id.toString()}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Section */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="credit-card"
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 gap-4 md:grid-cols-3"
                >
                  <Label
                    htmlFor="credit-card"
                    className="flex cursor-pointer items-start rounded-md border p-4 has-[[data-state=checked]]:border-primary"
                  >
                    <RadioGroupItem
                      value="credit-card"
                      id="credit-card"
                      className="mr-4"
                    />
                    <div className="text-sm">
                      <p>Credit Card</p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="on-delivery"
                    className="flex cursor-pointer items-start rounded-md border p-4 has-[[data-state=checked]]:border-primary"
                  >
                    <RadioGroupItem
                      value="on-delivery"
                      id="on-delivery"
                      className="mr-4"
                    />
                    <div className="text-sm">
                      <p>Pay on Delivery</p>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Section */}
          <div className="mt-6 w-full space-y-6 lg:mt-0 lg:max-w-xs xl:max-w-md">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voucher">Voucher Code</Label>
                  <div className="flex items-start gap-2">
                    <Input
                      id="voucher"
                      placeholder="e.g., SALE20"
                      value={voucherCode}
                      onChange={(e) =>
                        setVoucherCode(e.target.value.toUpperCase())
                      }
                      disabled={isApplyingVoucher || !!appliedVoucher}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={
                        !voucherCode || isApplyingVoucher || !!appliedVoucher
                      }
                      className="whitespace-nowrap"
                    >
                      {isApplyingVoucher && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Apply
                    </Button>
                  </div>
                  {appliedVoucher && (
                    <div className="flex items-center justify-between pt-1 text-sm">
                      <p className="text-green-600">
                        Applied:{" "}
                        <span className="font-semibold">
                          {appliedVoucher.code}
                        </span>
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-destructive"
                        onClick={handleRemoveVoucher}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
                <Separator />
                <dl className="flex items-center justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(orderSummary.subtotal)}</dd>
                </dl>
                <dl className="flex items-center justify-between gap-4">
                  <dt>Shipping</dt>
                  <dd>{formatPrice(orderSummary.shippingFee)}</dd>
                </dl>
                <dl className="flex items-center justify-between gap-4">
                  <dt>Tax (16%)</dt>
                  <dd>{formatPrice(orderSummary.tax)}</dd>
                </dl>
                {orderSummary.discount > 0 && (
                  <dl className="flex items-center justify-between gap-4 text-green-600">
                    <dt>Discount</dt>
                    <dd>-{formatPrice(orderSummary.discount)}</dd>
                  </dl>
                )}
                <Separator />
                <dl className="flex items-center justify-between gap-4">
                  <dt className="text-lg font-bold">Total</dt>
                  <dd className="text-lg font-bold">
                    {formatPrice(orderSummary.total)}
                  </dd>
                </dl>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </section>
  );
};
