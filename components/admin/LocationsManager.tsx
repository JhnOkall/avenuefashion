"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ICountry, ICounty, ICity } from "@/types";
import {
  createCountry,
  createCounty,
  createCity,
  updateCountry,
  updateCounty,
  updateCity,
} from "@/lib/data";
import { LocationForm } from "./LocationForm";

/**
 * Defines the possible types of locations that can be managed.
 */
type LocationType = "country" | "county" | "city";

/**
 * A union type representing any of the possible location documents.
 */
type EditableItem = ICountry | ICounty | ICity | null;

/**
 * Defines the props for the main LocationsManager component.
 */
interface LocationsManagerProps {
  initialCountries: ICountry[];
  initialCounties: ICounty[];
  initialCities: ICity[];
}

/**
 * A client component for the admin dashboard that provides a comprehensive UI
 * for managing the geographical location hierarchy (Countries, Counties, Cities).
 * It handles creating, updating, and toggling the status of locations.
 *
 * @param {LocationsManagerProps} props - The initial data for the component, pre-fetched on the server.
 */
export const LocationsManager = ({
  initialCountries,
  initialCounties,
  initialCities,
}: LocationsManagerProps) => {
  const router = useRouter();
  // `useTransition` provides a pending state for non-blocking UI updates during data mutations.
  const [isPending, startTransition] = useTransition();

  // State for controlling the visibility of the create/edit form dialog.
  const [isFormOpen, setIsFormOpen] = useState(false);
  // State to hold the location item currently being edited. Null for creation.
  const [editingItem, setEditingItem] = useState<EditableItem>(null);
  // State to determine which type of location is being created or edited.
  const [editingType, setEditingType] = useState<LocationType>("country");

  /**
   * Prepares and opens the form to edit an existing location item.
   * @param {EditableItem} item - The location object to be edited.
   * @param {LocationType} type - The type of the location.
   */
  const handleEdit = (item: EditableItem, type: LocationType) => {
    setEditingItem(item);
    setEditingType(type);
    setIsFormOpen(true);
  };

  /**
   * Prepares and opens the form to create a new location item.
   * @param {LocationType} type - The type of location to create.
   */
  const handleCreate = (type: LocationType) => {
    setEditingItem(null);
    setEditingType(type);
    setIsFormOpen(true);
  };

  /**
   * Toggles the `isActive` status of a location item.
   * @param {EditableItem} item - The location item whose status will be toggled.
   * @param {LocationType} type - The type of the location.
   */
  // TODO: Add a confirmation dialog before deactivating a location, as it could affect shipping options.
  const handleToggleStatus = (item: EditableItem, type: LocationType) => {
    if (!item) return;
    startTransition(async () => {
      try {
        const updateData = { isActive: !item.isActive };
        if (type === "country")
          await updateCountry(item._id.toString(), updateData);
        if (type === "county")
          await updateCounty(item._id.toString(), updateData);
        if (type === "city") await updateCity(item._id.toString(), updateData);

        toast.success("Success", {
          description: "Location status updated successfully.",
        });
        // Refresh server-side data to reflect the changes in the UI.
        router.refresh();
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message });
      }
    });
  };

  /**
   * Handles the save operation for both creating and editing a location.
   * It calls the appropriate API function based on the location type and whether an ID is present.
   *
   * @param {LocationType} type - The type of location being saved.
   * @param {any} data - The form data to be saved.
   * @param {string} [id] - The ID of the item being edited. If undefined, a new item is created.
   */
  const handleSave = async (type: LocationType, data: any, id?: string) => {
    startTransition(async () => {
      try {
        if (id) {
          // Update existing item.
          if (type === "country") await updateCountry(id, data);
          else if (type === "county") await updateCounty(id, data);
          else if (type === "city") await updateCity(id, data);
        } else {
          // Create new item.
          if (type === "country") await createCountry(data);
          else if (type === "county") await createCounty(data);
          else if (type === "city") await createCity(data);
        }

        toast.success("Success", {
          description: `Location '${data.name}' saved successfully.`,
        });
        setIsFormOpen(false);
        router.refresh();
      } catch (error: any) {
        toast.error("Save Failed", { description: error.message });
      }
    });
  };

  return (
    <div
      className="transition-opacity"
      style={{ opacity: isPending ? 0.7 : 1 }}
    >
      <Tabs defaultValue="countries">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="counties">Counties</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
        </TabsList>
        <TabsContent value="countries">
          <LocationTable
            items={initialCountries}
            type="country"
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            handleToggleStatus={handleToggleStatus}
          />
        </TabsContent>
        <TabsContent value="counties">
          <LocationTable
            items={initialCounties}
            type="county"
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            handleToggleStatus={handleToggleStatus}
          />
        </TabsContent>
        <TabsContent value="cities">
          <LocationTable
            items={initialCities}
            type="city"
            handleCreate={handleCreate}
            handleEdit={handleEdit}
            handleToggleStatus={handleToggleStatus}
          />
        </TabsContent>
      </Tabs>
      <LocationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        item={editingItem}
        type={editingType}
        countries={initialCountries}
        counties={initialCounties}
        onSave={handleSave}
      />
    </div>
  );
};

// =================================================================
// GENERIC TABLE SUB-COMPONENT
// =================================================================

/**
 * Defines the props for the reusable LocationTable component using generics.
 * @template T - The type of location item (ICountry, ICounty, or ICity).
 */
interface LocationTableProps<T extends EditableItem> {
  items: T[];
  type: LocationType;
  handleCreate: (type: LocationType) => void;
  handleEdit: (item: T, type: LocationType) => void;
  handleToggleStatus: (item: T, type: LocationType) => void;
}

/**
 * A generic, reusable table component for displaying a list of locations.
 * It adapts its columns and data rendering based on the `type` prop.
 *
 * @param {LocationTableProps<T>} props - The component's props.
 */
// TODO: Implement pagination for this table to handle large datasets efficiently.
// TODO: Add a "Delete" button with a confirmation dialog for removing locations.
const LocationTable = <T extends EditableItem>({
  items,
  type,
  handleCreate,
  handleEdit,
  handleToggleStatus,
}: LocationTableProps<T>) => (
  <div className="mt-4 rounded-md border">
    <div className="flex items-center justify-between p-4">
      <h3 className="font-semibold capitalize">{type}s</h3>
      <Button size="sm" onClick={() => handleCreate(type)}>
        Create New {type}
      </Button>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {type !== "country" && <TableHead>Parent</TableHead>}
          {type === "city" && <TableHead>Fee</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={(item as any)._id}>
            <TableCell>{(item as any).name}</TableCell>
            {/* Conditional rendering for parent relationship */}
            {type === "county" && (
              <TableCell>
                {((item as ICounty).country as ICountry)?.name}
              </TableCell>
            )}
            {type === "city" && (
              <TableCell>{((item as ICity).county as ICounty)?.name}</TableCell>
            )}
            {/* Conditional rendering for city-specific delivery fee */}
            {type === "city" && (
              <TableCell>${(item as ICity).deliveryFee}</TableCell>
            )}
            <TableCell>
              <Badge variant={(item as any).isActive ? "default" : "secondary"}>
                {(item as any).isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(item, type)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleStatus(item, type)}
              >
                {(item as any).isActive ? "Deactivate" : "Activate"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
