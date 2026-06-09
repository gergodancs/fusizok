import { BUDAPEST_DISTRICTS } from "@/lib/budapest-districts";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import { CRAFTSMAN_BIO_MAX_LENGTH } from "@/lib/chat-payment/constants";
import { inputClassName, labelClassName } from "@/lib/ui-classes";

type CraftsmanProfileFieldsProps = {
  defaultDistricts?: string[];
  defaultCategories?: string[];
  defaultBio?: string | null;
};

export function CraftsmanProfileFields({
  defaultDistricts = [],
  defaultCategories = [],
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

      <div className="space-y-2">
        <span className={labelClassName}>Milyen munkákat vállalsz?</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {JOB_CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800/80 px-3 py-2.5 text-sm text-zinc-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10"
            >
              <input
                type="checkbox"
                name="categories"
                value={category}
                defaultChecked={defaultCategories.includes(category)}
                className="accent-amber-500"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className={labelClassName}>
          Mely budapesti kerületekben vállalsz munkát?
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BUDAPEST_DISTRICTS.map((district) => (
            <label
              key={district}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-200 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10"
            >
              <input
                type="checkbox"
                name="districts"
                value={district}
                defaultChecked={defaultDistricts.includes(district)}
                className="accent-amber-500"
              />
              {district}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
