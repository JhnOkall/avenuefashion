"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICountry, ICounty, ICity } from "@/types";
import { Loader2 } from "lucide-react";

/**
 * Defines the possible types of locations that can be managed by this form.
 */
type LocationType = "country" | "county" | "city";

/**
 * A union type representing any of the possible location document types, or null.
 */
type EditableItem = ICountry | ICounty | ICity | null;

/**
 * Defines the props required by the LocationForm component.
 */
interface LocationFormProps {
  /**
   * A boolean to control the visibility of the dialog.
   */
  isOpen: boolean;
  /**
   * A callback function to close the dialog.
   */
  onClose: () => void;
  /**
   * The location object to be edited. If null, the form is in "create" mode.
   */
  item: EditableItem;
  /**
   * The type of location being created or edited, which determines the form fields to display.
   */
  type: LocationType;
  /**
   * An array of all countries, used to populate the parent dropdown for counties.
   */
  countries: ICountry[];
  /**
   * An array of all counties, used to populate the parent dropdown for cities.
   */
  counties: ICounty[];
  /**
   * A callback function to handle the save operation, passed from the parent component.
   * @param type - The type of location being saved.
   * @param data - The form data payload.
   * @param id - The ID of the item being edited (optional).
   */
  onSave: (type: LocationType, data: any, id?: string) => Promise<void>;
}

/**
 * A versatile form component within a dialog, used for both creating and editing
 * geographical locations (Countries, Counties, Cities). It dynamically adjusts
 * its fields based on the `type` prop.
 *
 * @param {LocationFormProps} props - The component's props for configuration and data handling.
 */
// TODO: Implement a more robust form validation solution using a library like `react-hook-form`
// and `zod` to provide better user feedback and ensure data integrity before submission.
export const LocationForm = ({
  isOpen,
  onClose,
  item,
  type,
  countries,
  counties,
  onSave,
}: LocationFormProps) => {
  // Local state for the form's controlled inputs.
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * A side effect that synchronizes the form's state with the `item` prop.
   * When the dialog opens (`isOpen` becomes true) or the `item` to be edited changes,
   * this effect populates the form fields for editing or resets them for creation.
   */
  useEffect(() => {
    if (item) {
      // Editing mode: Populate form with item data.
      setName(item.name);
      if ("deliveryFee" in item) setDeliveryFee(item.deliveryFee);
      // Safely access parent ID whether the field is populated or just a string ID.
      if ("country" in item) {
        setParentId(
          typeof item.country === "string"
            ? item.country
            : item.country._id.toString()
        );
      }
      if ("county" in item) {
        setParentId(
          typeof item.county === "string"
            ? item.county
            : item.county._id.toString()
        );
      }
    } else {
      // Creation mode: Reset all form fields.
      setName("");
      setParentId("");
      setDeliveryFee(0);
    }
  }, [item, isOpen]); // Rerun effect when the item or dialog visibility changes.

  /**
   * Handles the form submission by constructing the data payload based on the
   * location type and calling the `onSave` callback passed from the parent.
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const data: any = { name };

    // Conditionally add parent ID and delivery fee to the payload.
    if (type === "county") data.country = parentId;
    if (type === "city") {
      data.county = parentId;
      data.deliveryFee = deliveryFee;
    }

    // Delegate the async save operation to the parent component.
    await onSave(type, data, item?._id.toString());
    setIsSubmitting(false);
  };

  /**
   * A helper function to generate the dialog title dynamically based on whether
   * the form is in "create" or "edit" mode.
   * @returns {string} The formatted dialog title.
   */
  const getTitle = () =>
    `${item ? "Edit" : "Create"} ${
      type.charAt(0).toUpperCase() + type.slice(1)
    }`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="location-name">Name</Label>
            <Input
              id="location-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Conditional field for County */}
          {type === "county" && (
            <div className="space-y-2">
              <Label>Parent Country</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c._id.toString()} value={c._id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conditional fields for City */}
          {type === "city" && (
            <>
              <div className="space-y-2">
                <Label>Parent County</Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select County" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((c) => (
                      <SelectItem
                        key={c._id.toString()}
                        value={c._id.toString()}
                      >
                        {c.name} (
                        {typeof c.country === "object" && "name" in c.country
                          ? c.country.name
                          : ""}
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-fee">Delivery Fee</Label>
                <Input
                  id="delivery-fee"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
