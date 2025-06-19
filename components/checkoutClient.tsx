"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  IAddress,
  ICart,
  ICartItem,
  ICity,
  ICountry,
  ICounty,
  IOrder,
  IVoucher,
} from "@/types";
import {
  createAddress,
  fetchCitiesByCounty,
  fetchCountiesByCountry,
  placeOrder,
  validateVoucher,
} from "@/lib/data";

// --- Modernized Paystack Types ---

// 1. Updated global type for the modern, class-based PaystackPop
declare global {
  interface Window {
    PaystackPop?: new (config: PaystackConfig) => {
      open: () => void;
      close: () => void;
    };
  }
}

// 2. A strong type for the Paystack configuration object
interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  subaccount: string;
  metadata: {
    orderId: string;
    subaccount: string;
    [key: string]: any;
  };
  callback: (response: any) => void;
  onClose: () => void;
}

// 3. Clearer state management for the checkout process
type ProcessingState =
  | "idle"
  | "placing_order"
  | "awaiting_payment"
  | "verifying";

// --- Helper Components & Functions ---

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    price
  );

const OrderItemsCard = ({ cart }: { cart: ICart }) => (
  <Card>
    <CardHeader>
      <CardTitle>Your Items ({cart.items.length})</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {cart.items.map((item: ICartItem) => (
        <div
          key={`${item.product._id.toString()}-${item.variantId?.toString()}`}
          className="flex items-start gap-4"
        >
          <div className="relative h-16 w-16 shrink-0 rounded-md border">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
          <div className="flex-grow">
            <p className="font-medium">{item.name}</p>
            {item.variantOptions && (
              <p className="text-sm text-muted-foreground">
                {Object.entries(item.variantOptions)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Qty: {item.quantity}
            </p>
          </div>
          <p className="font-medium">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      ))}
    </CardContent>
  </Card>
);

// --- Main Checkout Component ---

type UserSession = { name?: string | null; email?: string | null; id?: string };
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

  // Component state
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
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle");
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

  // --- Address and Location Logic ---
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
    } finally {
      setIsLoadingCounties(false);
      setIsLoadingCities(false);
    }
  };

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
    } finally {
      setIsLoadingCities(false);
    }
  };

  // --- Order Calculation and Vouchers ---
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
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    try {
      const validVoucher = await validateVoucher(voucherCode);
      setAppliedVoucher(validVoucher);
      toast.success("Voucher applied!");
    } catch (error: any) {
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

  // --- ROBUST PAYMENT VERIFICATION ---
  /**
   * Polls the backend to verify if the order status has been updated to 'Completed'.
   * @param {string} orderId The ID of the order to verify (using the order's custom 'orderId' field).
   * @returns {Promise<boolean>} A promise that resolves to true if the order is completed.
   */
  const verifyPayment = async (orderId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 15; // Poll for 30 seconds
      const interval = 2000; // 2 seconds

      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "Completed") {
              clearInterval(poll);
              resolve(true);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          resolve(false);
        }
      }, interval);
    });
  };

  // --- MODERNIZED CHECKOUT FLOW ---
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Paystack configuration if it's the selected payment method
    if (paymentMethod === "paystack") {
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      const subaccountCode = process.env.NEXT_PUBLIC_PAYSTACK_SUBACCOUNT;
      if (!paystackPublicKey || !subaccountCode) {
        toast.error("Payment configuration error. Please contact support.");
        console.error("FATAL: Paystack public key or subaccount is missing.");
        return;
      }
    }

    setProcessingState("placing_order");
    const loadingToast = toast.loading("Placing your order...");

    try {
      // 2. Determine or create the delivery address
      let finalAddressId = selectedAddressId;
      if (deliveryOption === "use-new") {
        if (!shippingDetails.streetAddress.trim() || !selectedCityId) {
          toast.warning("Please complete all new address fields.");
          setProcessingState("idle");
          toast.dismiss(loadingToast);
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
        toast.warning("Please select a delivery address.");
        setProcessingState("idle");
        toast.dismiss(loadingToast);
        return;
      }

      // 3. Place the order in the database (status will be 'Pending')
      const newOrder = await placeOrder({
        addressId: finalAddressId,
        paymentMethod,
        voucherCode: appliedVoucher?.code,
      });

      toast.dismiss(loadingToast);

      // 4. Handle payment based on the chosen method
      if (paymentMethod === "paystack") {
        setProcessingState("awaiting_payment");
        const paystackConfig: PaystackConfig = {
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: shippingDetails.email,
          amount: Math.round(orderSummary.total * 100),
          currency: "KES",
          ref: newOrder.orderId, // Use the unique orderId from your backend
          subaccount: process.env.NEXT_PUBLIC_PAYSTACK_SUBACCOUNT!,
          metadata: {
            orderId: newOrder.orderId,
            subaccount: process.env.NEXT_PUBLIC_PAYSTACK_SUBACCOUNT!,
          },
          callback: async () => {
            setProcessingState("verifying");
            const verificationToast = toast.loading(
              "Payment received, verifying..."
            );
            const isVerified = await verifyPayment(newOrder.orderId);
            toast.dismiss(verificationToast);
            if (isVerified) {
              toast.success("Order confirmed!");
              router.push(`/success?orderId=${newOrder.orderId}`);
            } else {
              toast.info("Your payment is processing.", {
                description:
                  "We'll confirm your order shortly. Check its status in your dashboard.",
              });
              router.push("/orders"); // Redirect to order history
            }
          },
          onClose: () => {
            if (processingState === "awaiting_payment") {
              toast.info("Payment was cancelled.");
              setProcessingState("idle");
            }
          },
        };

        if (!window.PaystackPop) {
          toast.error("Payment gateway failed to load. Please refresh.");
          setProcessingState("idle");
          return;
        }

        const handler = new window.PaystackPop(paystackConfig);
        handler.open();
      } else {
        // Handle 'Pay on Delivery'
        toast.success("Order placed successfully!");
        router.push(`/success?orderId=${newOrder.orderId}`);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error("Order Failed", { description: error.message });
      setProcessingState("idle");
    }
  };

  // --- UI Logic ---
  const isProcessing = processingState !== "idle";

  const getButtonText = () => {
    switch (processingState) {
      case "placing_order":
        return "Placing Order...";
      case "awaiting_payment":
        return "Awaiting Payment...";
      case "verifying":
        return "Verifying...";
      default:
        return paymentMethod === "paystack"
          ? `Pay ${formatPrice(orderSummary.total)}`
          : "Place Order on Delivery";
    }
  };

  return (
    <section className="bg-background py-8 md:py-16">
      <form
        onSubmit={handleCheckout}
        className="mx-auto max-w-screen-xl px-4 2xl:px-0"
      >
        <div className="lg:flex lg:items-start lg:gap-12 xl:gap-16">
          <div className="min-w-0 flex-1 space-y-8">
            <OrderItemsCard cart={cart} />
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

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="paystack"
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2"
                >
                  <Label
                    htmlFor="paystack"
                    className="flex cursor-pointer items-start rounded-md border p-4 has-[[data-state=checked]]:border-primary"
                  >
                    <RadioGroupItem
                      value="paystack"
                      id="paystack"
                      className="mr-4"
                    />
                    <div>
                      <p>Pay with Card / M-PESA</p>
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
                    <div>
                      <p>Pay on Delivery</p>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

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
                  disabled={isProcessing}
                >
                  {isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {getButtonText()}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </section>
  );
};
