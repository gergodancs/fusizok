import { CategorySkillPicker } from "@/components/categories/category-skill-picker";
import { CraftsmanLocationFields } from "@/components/craftsman/craftsman-location-fields";
import { CRAFTSMAN_BIO_MAX_LENGTH } from "@/lib/chat-payment/constants";
import type { CraftsmanLocationEdit } from "@/lib/craftsman-profile";
import { inputClassName, labelClassName } from "@/lib/ui-classes";

type CraftsmanProfileFieldsProps = {
  defaultLocation: CraftsmanLocationEdit;
  defaultCategories?: string[];
  defaultSubCategories?: string[];
  defaultBio?: string | null;
};

export function CraftsmanProfileFields({
  defaultLocation,
  defaultCategories = [],
  defaultSubCategories = [],
  defaultBio = null,
}: CraftsmanProfileFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="craftsman-bio" className={labelClassName}>
          Bemutatkozás
        </label>
        <p className="text-sm text-zinc-500">
          Írj pár mondatot magadról, tapasztalataidról – a lakosok a pályázatod
          után látják ezt a profilodon.
        </p>
        <textarea
          id="craftsman-bio"
          name="bio"
          rows={5}
          maxLength={CRAFTSMAN_BIO_MAX_LENGTH}
          defaultValue={defaultBio ?? ""}
          placeholder="Pl. 10 éve foglalkozom csempézéssel, precíz és tiszta munkát vállalok…"
          className={inputClassName}
        />
        <p className="text-xs text-zinc-600">
          Max. {CRAFTSMAN_BIO_MAX_LENGTH} karakter
        </p>
      </div>

      <CategorySkillPicker
        mode="craftsman"
        defaultMainCategories={defaultCategories}
        defaultSubCategories={defaultSubCategories}
      />

      <CraftsmanLocationFields defaultLocation={defaultLocation} />
    </>
  );
}
