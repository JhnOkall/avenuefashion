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
  createAddress,
} from "@/lib/data";

/**
 * Formats a numeric price into a localized currency string.
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

type UserSession = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
};

interface CheckoutClientProps {
  user: UserSession;
  cart: ICart;
  addresses: IAddress[];
  countries: ICountry[];
}

export const CheckoutClient = ({
  user,
  cart,
  addresses,
  countries,
}: CheckoutClientProps) => {
  const router = useRouter();

  // State to manage delivery address choice: 'use-saved' or 'use-new'
  const [deliveryOption, setDeliveryOption] = useState("use-saved");

  const [shippingDetails, setShippingDetails] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: "",
    streetAddress: "",
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCountyId, setSelectedCountyId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [counties, setCounties] = useState<ICounty[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoadingCounties, setIsLoadingCounties] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<IVoucher | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  // Helper to populate the entire form from a saved address object
  const setFormFromAddress = async (address: IAddress) => {
    setSelectedAddressId(address._id.toString());
    setShippingDetails({
      name: address.recipientName,
      email: user.email ?? "",
      phone: address.phone,
      streetAddress: address.streetAddress,
    });

    setIsLoadingCounties(true);
    setIsLoadingCities(true);
    const countryId = (address.country as ICountry)._id.toString();
    const countyId = (address.county as ICounty)._id.toString();
    const cityId = (address.city as ICity)._id.toString();

    try {
      setSelectedCountryId(countryId);
      const fetchedCounties = await fetchCountiesByCountry(countryId);
      setCounties(fetchedCounties);
      setSelectedCountyId(countyId);
      const fetchedCities = await fetchCitiesByCounty(countyId);
      setCities(fetchedCities);
      setSelectedCityId(cityId);
    } catch (error) {
      toast.error("Error", { description: "Failed to load address location." });
      setSelectedCountyId("");
      setSelectedCityId("");
    } finally {
      setIsLoadingCounties(false);
      setIsLoadingCities(false);
    }
  };

  // Handler to clear the form when switching to "new address"
  const handleNewAddressSelect = () => {
    setSelectedAddressId(null);
    setShippingDetails({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: "",
      streetAddress: "",
    });
    setSelectedCountryId("");
    setSelectedCountyId("");
    setSelectedCityId("");
    setCounties([]);
    setCities([]);
  };

  useEffect(() => {
    const defaultAddress =
      addresses.find((a) => a.isDefault) ||
      (addresses.length > 0 ? addresses[0] : null);
    if (defaultAddress) {
      setDeliveryOption("use-saved");
      setFormFromAddress(defaultAddress);
    } else {
      setDeliveryOption("use-new");
    }
  }, [addresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingDetails({ ...shippingDetails, [e.target.id]: e.target.value });
  };

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

  const orderSummary = useMemo(() => {
    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingFee =
      cities.find((c) => c._id.toString() === selectedCityId)?.deliveryFee ?? 0;
    const tax = subtotal * 0.16;
    let discount = 0;
    if (appliedVoucher) {
      discount =
        appliedVoucher.discountType === "percentage"
          ? subtotal * (appliedVoucher.discountValue / 100)
          : appliedVoucher.discountValue;
    }
    const total = Math.max(0, subtotal + shippingFee + tax - discount);
    return { subtotal, shippingFee, tax, discount, total };
  }, [cart, cities, selectedCityId, appliedVoucher]);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim())
      return toast.warning("Please enter a voucher code.");
    setIsApplyingVoucher(true);
    try {
      const validVoucher = await validateVoucher(voucherCode);
      setAppliedVoucher(validVoucher);
      toast.success("Voucher applied successfully!");
    } catch (error: any) {
      setAppliedVoucher(null);
      toast.error("Invalid Voucher", { description: error.message });
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    toast.info("Voucher removed.");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let finalAddressId = selectedAddressId;

    try {
      if (deliveryOption === "use-new") {
        if (!shippingDetails.streetAddress.trim() || !selectedCityId) {
          toast.warning("Validation Error", {
            description: "Please complete all new address fields.",
          });
          setIsSubmitting(false);
          return;
        }
        const newAddress = await createAddress({
          recipientName: shippingDetails.name,
          phone: shippingDetails.phone,
          streetAddress: shippingDetails.streetAddress,
          country: selectedCountryId,
          county: selectedCountyId,
          city: selectedCityId,
          isDefault: addresses.length === 0,
        });
        finalAddressId = newAddress._id.toString();
      }

      if (!finalAddressId) {
        toast.warning("Validation Error", {
          description: "Please select a delivery address.",
        });
        setIsSubmitting(false);
        return;
      }

      const newOrder = await placeOrder({
        addressId: finalAddressId,
        paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      });

      router.push(`/success?orderId=${newOrder.orderId}`);
    } catch (error: any) {
      toast.error("Order Failed", {
        description: error.message || "An unexpected error occurred.",
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
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={deliveryOption}
                  onValueChange={setDeliveryOption}
                  className="flex gap-4"
                >
                  <Label
                    htmlFor="use-saved"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value="use-saved"
                      id="use-saved"
                      disabled={addresses.length === 0}
                      onClick={() => setFormFromAddress(addresses[0])}
                    />
                    <span>Use saved address</span>
                  </Label>
                  <Label
                    htmlFor="use-new"
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value="use-new"
                      id="use-new"
                      onClick={handleNewAddressSelect}
                    />
                    <span>Enter new address</span>
                  </Label>
                </RadioGroup>

                <Separator />

                {deliveryOption === "use-saved" && (
                  <div className="space-y-2">
                    <Label>Select a saved address</Label>
                    <RadioGroup
                      onValueChange={(id) =>
                        setFormFromAddress(
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
                  </div>
                )}

                {deliveryOption === "use-new" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Recipient name*</Label>
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
                      <Label htmlFor="streetAddress">Street Address*</Label>
                      <Input
                        id="streetAddress"
                        value={shippingDetails.streetAddress}
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
                    <div className="space-y-2 sm:col-span-2">
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
                )}
              </CardContent>
            </Card>

            {/* Payment Method Section (unchanged) */}
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

          {/* Order Summary Section (unchanged) */}
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
                      )}{" "}
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
