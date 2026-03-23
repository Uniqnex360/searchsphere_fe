import AppFormInput from "./AppFormInput";
import { Trash2, Plus } from "lucide-react";

interface SectionProps<T> {
  title: string;
  fields: T[];
  register: any;
  errors: any;
  append: (item: any) => void;
  remove: (index: number) => void;
  isDetail: boolean;
  type: "image" | "video" | "document" | "feature" | "attribute";
}

export function AppArrayInput<T>({
  title,
  fields,
  register,
  errors,
  append,
  remove,
  isDetail,
  type,
}: SectionProps<T>) {
  return (
    <div className="mb-4 relative p-3 rounded">
      <h3 className="font-semibold mb-2">{title}</h3>

      <div className="relative flex flex-col gap-3 max-h-[250px] overflow-y-auto">
        {fields.map((field: any, index: number) => (
          <div
            key={field.id}
            className="flex items-center gap-2 bg-gray-50 p-2 rounded"
          >
            {/* Image preview */}
            {type === "image" && field.url && (
              <img
                src={field.url}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 object-cover rounded border border-gray-200"
              />
            )}
            {type === "image" && !field.url && (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                Preview
              </div>
            )}

            {/* Input rendering */}
            {type === "attribute" ? (
              <>
                <AppFormInput
                  label="Attribute Name"
                  name={`attributes.${index}.attribute_name` as const}
                  placeholder="Attribute Name"
                  register={register}
                  error={errors?.[index]?.attribute_name}
                  formState={errors}
                  className="flex-1"
                />
                <AppFormInput
                  label="Attribute Value"
                  name={`attributes.${index}.attribute_value` as const}
                  placeholder="Attribute Value"
                  register={register}
                  error={errors?.[index]?.attribute_value}
                  formState={errors}
                  className="flex-1"
                />
              </>
            ) : type === "feature" ? (
              <AppFormInput
                label={`Feature ${index + 1}`}
                name={`features.${index}.value` as const}
                placeholder="Feature"
                register={register}
                error={errors?.[index]?.value}
                formState={errors}
                className="flex-1"
              />
            ) : (
              <AppFormInput
                label={`${type.charAt(0).toUpperCase() + type.slice(1)} ${
                  index + 1
                }`}
                name={`${type}s.${index}.url` as const}
                placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} URL`}
                register={register}
                error={errors?.[index]?.url}
                formState={errors}
                className="flex-1"
              />
            )}

            {/* Delete button */}
            {!isDetail && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}

        {/* Add button */}
        {!isDetail && (
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() =>
                append(
                  type === "attribute"
                    ? {
                        id: Date.now(),
                        attribute_name: "",
                        attribute_value: "",
                      }
                    : type === "feature"
                      ? { id: Date.now(), value: "" }
                      : { id: Date.now(), url: "", name: "" },
                )
              }
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Plus size={16} /> Add{" "}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
