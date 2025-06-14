"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { IProduct, IReview } from "@/types";
import {
  fetchReviewsByProduct,
  ReviewsApiResponse,
  submitReview,
} from "@/lib/data";

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * Renders a star rating display. Can be interactive or read-only.
 *
 * @param {object} props - The component props.
 * @param {number} props.rating - The current rating value (e.g., 3 out of 5).
 * @param {(r: number) => void} [props.setRating] - Optional callback to make the component interactive. If provided, clicking a star will call this function with the new rating.
 * @param {string} [props.className] - Optional class names for the star icons.
 */
const StarRating = ({
  rating,
  setRating,
  className = "h-4 w-4",
}: {
  rating: number;
  setRating?: (r: number) => void;
  className?: string;
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={`star-${i}`}
        onClick={() => setRating?.(i + 1)}
        aria-label={
          setRating ? `Set rating to ${i + 1}` : `${rating} out of 5 stars`
        }
        className={`${className} ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted stroke-muted-foreground"
        } ${setRating ? "cursor-pointer" : ""}`}
      />
    ))}
  </div>
);

/**
 * A form component for submitting a new product review.
 *
 * @param {object} props - The component props.
 * @param {string} props.productId - The ID of the product being reviewed.
 * @param {() => void} props.onReviewSubmit - Callback function executed upon successful submission.
 */
// TODO: Implement more robust form handling and validation using a library like `react-hook-form` and `zod`.
const ReviewForm = ({
  productId,
  onReviewSubmit,
}: {
  productId: string;
  onReviewSubmit: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  // `useTransition` provides a pending state for non-blocking UI updates during submission.
  const [isSubmitting, startTransition] = useTransition();

  /**
   * Handles the form submission process.
   */
  const handleSubmit = () => {
    startTransition(async () => {
      try {
        if (rating === 0 || !title.trim() || !text.trim()) {
          throw new Error("Please fill all fields and provide a rating.");
        }
        await submitReview(productId, { rating, title, text });
        toast.success("Success!", {
          description: "Your review has been submitted for approval.",
        });
        onReviewSubmit();
      } catch (error: any) {
        toast.error("Submission Failed", {
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label>Your Rating*</Label>
        <StarRating rating={rating} setRating={setRating} className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-title">Review Title*</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Excellent product!"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-description">Review Description*</Label>
        <Textarea
          id="review-description"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your experience..."
        />
      </div>
      {/* TODO: Add a file input component here for review image uploads. */}
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </DialogFooter>
    </div>
  );
};

// =================================================================
// MAIN COMPONENT
// =================================================================

interface ProductReviewsClientProps {
  product: IProduct;
  initialReviewsData: ReviewsApiResponse;
}

/**
 * A client component that displays product reviews, handles review submission,
 * and manages "load more" functionality.
 *
 * @param {ProductReviewsClientProps} props - The component props.
 */
export const ProductReviewsClient = ({
  product,
  initialReviewsData,
}: ProductReviewsClientProps) => {
  const router = useRouter();
  // State for the list of reviews displayed on the client.
  const [reviews, setReviews] = useState(initialReviewsData.data);
  // State for managing the pagination of loaded reviews.
  const [pagination, setPagination] = useState({
    currentPage: initialReviewsData.currentPage,
    totalPages: initialReviewsData.totalPages,
  });
  // State for the review submission dialog.
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
  // Transition state for loading more reviews to prevent UI blocking.
  const [isLoadingMore, startLoadingTransition] = useTransition();

  /**
   * Fetches the next page of reviews and appends them to the current list.
   */
  const loadMoreReviews = () => {
    if (pagination.currentPage >= pagination.totalPages) return;
    startLoadingTransition(async () => {
      try {
        const nextPage = pagination.currentPage + 1;
        const newReviewsData = await fetchReviewsByProduct(
          product._id.toString(),
          {
            page: nextPage,
            limit: 5, // A common limit for loading more items.
          }
        );
        setReviews((prev) => [...prev, ...newReviewsData.data]);
        setPagination({
          currentPage: newReviewsData.currentPage,
          totalPages: newReviewsData.totalPages,
        });
      } catch (error) {
        toast.error("Error", {
          description: "Could not load more reviews.",
        });
      }
    });
  };

  return (
    <section id="reviews" className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="text-2xl font-semibold">
            Customer Reviews ({product.numReviews})
          </h2>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} />
            <p className="text-sm text-muted-foreground">
              ({product.rating.toFixed(1)} out of 5)
            </p>
          </div>
        </div>
        <div className="my-6 gap-8 sm:flex sm:items-start md:my-8">
          <div className="shrink-0 space-y-4 text-center sm:text-left">
            <p className="text-2xl font-semibold">
              {product.rating.toFixed(2)} out of 5
            </p>
            <Dialog
              open={isReviewDialogOpen}
              onOpenChange={setReviewDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Write a review</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add a Review for {product.name}</DialogTitle>
                </DialogHeader>
                <ReviewForm
                  productId={product._id.toString()}
                  onReviewSubmit={() => {
                    setReviewDialogOpen(false);
                    // Refresh server-side props to update review counts and average rating.
                    router.refresh();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          {/* TODO: Implement a detailed rating breakdown component. This would require an API endpoint that returns counts for each star rating (e.g., { 5: 120, 4: 50, ... }). */}
          <div className="mt-6 min-w-0 flex-1 space-y-3 sm:mt-0">
            <p className="text-muted-foreground">
              A detailed rating breakdown will be available soon.
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {reviews.map((review) => {
            // Safely access user details, as the `user` field might not be populated.
            const user = typeof review.user === "object" ? review.user : null;
            return (
              <article
                key={review._id.toString()}
                className="gap-4 py-6 sm:flex"
              >
                <div className="mb-4 shrink-0 sm:mb-0 sm:w-48 md:w-72">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={
                          user && typeof user === "object" && "image" in user
                            ? (user.image as string)
                            : ""
                        }
                        alt={
                          user && typeof user === "object" && "name" in user
                            ? (user.name as string)
                            : ""
                        }
                      />
                      <AvatarFallback>
                        {user && typeof user === "object" && "name" in user
                          ? (user.name as string).charAt(0)
                          : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {typeof user === "object" &&
                        user !== null &&
                        "name" in user
                          ? user.name
                          : "Anonymous"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.isVerified && (
                    // TODO: Implement the backend logic to verify if the user purchased this product before setting this flag.
                    <Badge variant="secondary" className="mt-2">
                      <CheckCircle className="mr-1.5 h-4 w-4 text-green-600" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <h3 className="font-semibold">{review.title}</h3>
                  <p className="text-muted-foreground">{review.text}</p>
                </div>
              </article>
            );
          })}
        </div>
        {pagination.currentPage < pagination.totalPages && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={loadMoreReviews}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Loading..." : "Load More Reviews"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
