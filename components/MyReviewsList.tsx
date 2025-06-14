"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Star, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { IReview } from "@/types";
import { MyReviewsApiResponse, deleteReview, updateReview } from "@/lib/data";

// =================================================================
// SUB-COMPONENTS
// =================================================================

/**
 * A reusable component for displaying a star rating. Can be interactive or read-only.
 * @param {object} props - The component props.
 * @param {number} props.rating - The current rating value.
 * @param {(r: number) => void} [props.setRating] - Optional callback to make the component interactive.
 */
// TODO: This component is duplicated across multiple files. It should be extracted to a shared UI directory (e.g., `components/ui/star-rating.tsx`) to promote reusability.
const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating?: (r: number) => void;
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted stroke-muted-foreground"
        } ${setRating ? "cursor-pointer" : ""}`}
        onClick={() => setRating?.(i + 1)}
      />
    ))}
  </div>
);

/**
 * A component that provides "Edit" and "Delete" actions for a single review
 * within a dropdown menu, including the necessary dialogs and confirmation modals.
 *
 * @param {object} props - The component props.
 * @param {IReview} props.review - The review object to be acted upon.
 */
const ReviewActions = ({ review }: { review: IReview }) => {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedText, setEditedText] = useState(review.text);
  const [editedRating, setEditedRating] = useState(review.rating);

  /**
   * Handles the submission of the updated review data.
   */
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await updateReview(review._id.toString(), {
        // The title is not editable in this UI, so we pass the original.
        title: review.title,
        text: editedText,
        rating: editedRating,
      });
      toast.success("Success", { description: "Review updated successfully." });
      setIsEditDialogOpen(false);
      // Re-fetches data on the server and re-renders server components.
      router.refresh();
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles the deletion of the review after confirmation.
   */
  const handleDelete = async () => {
    try {
      await deleteReview(review._id.toString());
      toast.success("Success", { description: "Review deleted successfully." });
      router.refresh();
    } catch (error: any) {
      toast.error("Error", { description: error.message });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <span className="sr-only">Open review actions</span>
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            {/* `onSelect` prevents the dropdown from closing when the dialog is triggered. */}
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
              <DialogDescription>
                For{" "}
                {typeof review.product === "object" && "name" in review.product
                  ? review.product.name
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating rating={editedRating} setRating={setEditedRating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-text-edit">Review</Label>
                <Textarea
                  id="review-text-edit"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your review for "
                {typeof review.product === "object" && "name" in review.product
                  ? review.product.name
                  : "this product"}
                ". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                // TODO: The `AlertDialogAction` component should use the `destructive` variant from `shadcn/ui` for proper styling.
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Renders a single review item in the list, displaying its rating, product name,
 * content, and associated actions.
 * @param {object} props - The component props.
 * @param {IReview} props.review - The review data to display.
 */
const ReviewItem = ({ review }: { review: IReview }) => (
  <article className="grid items-start gap-4 py-6 md:grid-cols-12 md:gap-6">
    <div className="order-1 flex items-center justify-between md:col-span-3">
      <StarRating rating={review.rating} />
      <div className="md:hidden">
        <ReviewActions review={review} />
      </div>
    </div>
    <div className="order-3 md:order-2 md:col-span-3">
      <Link
        href={`/${
          typeof review.product === "object" && "slug" in review.product
            ? review.product.slug
            : ""
        }`}
        className="text-base font-semibold text-foreground hover:underline"
      >
        {typeof review.product === "object" && "name" in review.product
          ? review.product.name
          : ""}
      </Link>
    </div>
    <div className="order-4 md:col-span-5">
      <p className="text-muted-foreground">{review.text}</p>
    </div>
    <div className="order-2 hidden text-right md:order-5 md:col-span-1 md:block">
      <ReviewActions review={review} />
    </div>
  </article>
);

// =================================================================
// MAIN COMPONENT
// =================================================================

interface MyReviewsListProps {
  reviewsData: MyReviewsApiResponse;
}

/**
 * A client component that displays a filterable and paginated list of the current user's reviews.
 * It manages state through URL search parameters for better user experience and shareability.
 * @param {MyReviewsListProps} props - Component props containing initial review data.
 */
export const MyReviewsList = ({ reviewsData }: MyReviewsListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: reviews, totalPages, currentPage } = reviewsData;

  /**
   * Handles changes in filters or pagination by updating the URL search parameters,
   * which triggers a re-render with the new data.
   * @param {'rating' | 'page'} key - The URL parameter to update.
   * @param {string | number} value - The new value for the parameter.
   */
  const handleUrlStateChange = (
    key: "rating" | "page",
    value: string | number
  ) => {
    const currentParams = new URLSearchParams(searchParams);
    currentParams.set(key, String(value));
    // Reset to the first page when a filter is changed.
    if (key === "rating") {
      currentParams.delete("page");
    }
    router.replace(`${pathname}?${currentParams.toString()}`);
  };

  return (
    <section className="bg-background py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-5xl">
          <div className="gap-4 sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              My Reviews
            </h2>
            <div className="mt-6 sm:mt-0">
              <Select
                defaultValue={searchParams.get("rating") || "all"}
                onValueChange={(value) => handleUrlStateChange("rating", value)}
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-auto">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All reviews</SelectItem>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} star{r > 1 && "s"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-6 flow-root sm:mt-8">
            {reviews && reviews.length > 0 ? (
              <div className="divide-y divide-border">
                {reviews.map((review) => (
                  <ReviewItem key={review._id.toString()} review={review} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <p>
                  You haven't written any reviews yet, or none match your
                  filter.
                </p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handleUrlStateChange("page", currentPage - 1)
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
                {/* TODO: For a large number of pages, implement pagination with ellipsis (...) to avoid rendering too many page links. */}
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handleUrlStateChange("page", i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handleUrlStateChange("page", currentPage + 1)
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </section>
  );
};
