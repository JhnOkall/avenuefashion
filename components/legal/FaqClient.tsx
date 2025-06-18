"use-client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Defines the structure for a single question-and-answer pair.
 * The answer can be a string or JSX to allow for links and formatting.
 */
interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

/**
 * A centralized array of FAQ data. This makes it easy to add, remove,
 * or edit questions without changing the component's structure.
 */
const faqData: FaqItem[] = [
  {
    question: "How do I place an order?",
    answer: (
      <p>
        Placing an order is simple! Browse our products, select your desired
        items, and add them to your shopping cart. When you're ready, click the
        cart icon and proceed to checkout. You will be prompted to enter your
        shipping details and choose a payment method to complete the purchase.
      </p>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer: (
      <p>
        We accept a variety of payment methods for your convenience, including
        major Credit/Debit Cards (Visa, MasterCard) and mobile payments via
        M-Pesa and Airtel money. All payment options available will be displayed
        at checkout.
      </p>
    ),
  },
  {
    question: "What are your shipping times and costs?",
    answer: (
      <>
        <p>
          We process all orders within 1-3 business days. Delivery times and
          costs vary by location:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            <strong>Nairobi & Metropolitan Area:</strong> 1-3 business days.
          </li>
        </ul>
        <p>
          Your final shipping fee will be calculated and displayed at checkout
          based on your delivery address. For more details, please see our{" "}
          <Link
            href="/shipping-policy"
            className="text-primary hover:underline"
          >
            Shipping Policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    question: "How can I track my order?",
    answer: (
      <p>
        Once your order has shipped, you will receive a confirmation email
        containing a tracking number. You can use this number on the respective
        courier's website to track your package. You can also view your order
        status and history at any time by logging into your account and visiting
        the "My Orders" page.
      </p>
    ),
  },
  {
    question: "What is your return policy?",
    answer: (
      <p>
        We accept returns within 7 calendar days of delivery for most items,
        provided they are unused, unworn, and in their original condition with
        all tags attached. Certain items like swimwear and earrings are
        non-returnable for hygiene reasons. For a complete guide, please read
        our full{" "}
        <Link href="/returns-policy" className="text-primary hover:underline">
          Returns & Refunds Policy
        </Link>
        .
      </p>
    ),
  },
  {
    question: "How do I return an item?",
    answer: (
      <p>
        To initiate a return, please email our support team at{" "}
        <a
          href="mailto:support@avenuefashion.example.com"
          className="text-primary hover:underline"
        >
          support@avenuefashion.example.com
        </a>{" "}
        with your order number and the reason for the return. Our team will
        guide you through the next steps.
      </p>
    ),
  },
  {
    question: "Do I need an account to place an order?",
    answer: (
      <p>
        While you can browse our site as a guest, you will need to create an
        account to complete a purchase. Creating an account allows you to track
        your orders, manage your addresses, view your purchase history, and
        enjoy a faster checkout experience in the future.
      </p>
    ),
  },
];

/**
 * Renders the full FAQ content for Avenue Fashion using an accordion.
 */
export function FaqClient() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold md:text-4xl">
          Frequently Asked Questions
        </CardTitle>
        <p className="text-muted-foreground">
          Have a question? We're here to help.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
