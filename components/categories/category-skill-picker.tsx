"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  getMainCategoryIdForSub,
  MAIN_CATEGORIES,
} from "@/lib/constants/categories";
import { labelClassName } from "@/lib/ui-classes";

type CategorySkillPickerProps = {
  mode: "craftsman" | "job";
  defaultMainCategories?: string[];
  defaultMainCategory?: string;
  defaultSubCategories?: string[];
};

export function CategorySkillPicker({
  mode,
  defaultMainCategories = [],
  defaultMainCategory = "",
  defaultSubCategories = [],
}: CategorySkillPickerProps) {
  const initialMains = useMemo(() => {
    if (mode === "job") {
      return defaultMainCategory ? [defaultMainCategory] : [];
    }
    const fromSubs = defaultSubCategories
      .map(getMainCategoryIdForSub)
      .filter((id): id is string => Boolean(id));
    return [...new Set([...defaultMainCategories, ...fromSubs])];
  }, [
    mode,
    defaultMainCategories,
    defaultMainCategory,
    defaultSubCategories,
  ]);

  const [selectedMains, setSelectedMains] = useState<Set<string>>(
    () => new Set(initialMains),
  );
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(
    () => new Set(defaultSubCategories),
  );
  const [expandedMains, setExpandedMains] = useState<Set<string>>(
    () => new Set(initialMains),
  );

  function toggleMain(mainId: string, checked: boolean) {
    if (mode === "job") {
      const nextMains = checked ? new Set([mainId]) : new Set<string>();
      const nextSubs = new Set(
        [...selectedSubs].filter((sub) => getMainCategoryIdForSub(sub) === mainId),
      );
      setSelectedMains(nextMains);
      setSelectedSubs(nextSubs);
      setExpandedMains(checked ? new Set([mainId]) : new Set());
      return;
    }

    const nextMains = new Set(selectedMains);
    const nextSubs = new Set(selectedSubs);
    const nextExpanded = new Set(expandedMains);

    if (checked) {
      nextMains.add(mainId);
      nextExpanded.add(mainId);
    } else {
      nextMains.delete(mainId);
      nextExpanded.delete(mainId);
      for (const sub of nextSubs) {
        if (getMainCategoryIdForSub(sub) === mainId) {
          nextSubs.delete(sub);
        }
      }
    }

    setSelectedMains(nextMains);
    setSelectedSubs(nextSubs);
    setExpandedMains(nextExpanded);
  }

  function toggleSub(subKey: string, checked: boolean) {
    const nextSubs = new Set(selectedSubs);
    const parentId = getMainCategoryIdForSub(subKey);

    if (mode === "job") {
      if (checked) {
        nextSubs.add(subKey);
      } else {
        nextSubs.delete(subKey);
      }
      setSelectedSubs(nextSubs);
      return;
    }

    if (checked) {
      nextSubs.add(subKey);
      if (parentId) {
        const nextMains = new Set(selectedMains);
        nextMains.add(parentId);
        setSelectedMains(nextMains);
        setExpandedMains((prev) => new Set(prev).add(parentId));
      }
    } else {
      nextSubs.delete(subKey);
    }

    setSelectedSubs(nextSubs);
  }

  function toggleExpanded(mainId: string) {
    setExpandedMains((prev) => {
      const next = new Set(prev);
      if (next.has(mainId)) {
        next.delete(mainId);
      } else {
        next.add(mainId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <span className={labelClassName}>
          {mode === "craftsman"
            ? "Milyen munkákat vállalsz?"
            : "Milyen tevékenységre van szükség?"}
        </span>
        <p className="mt-1 text-sm text-zinc-500">
          Válassz főkategóriát, majd jelöld be a konkrét al-tevékenységeket.
          {mode === "job"
            ? " Legalább egy al-tevékenység kötelező."
            : " Minden főkategóriához legalább egy al-tevékenység szükséges."}
        </p>
      </div>

      <div className="space-y-2">
        {MAIN_CATEGORIES.map((main) => {
          const isMainSelected = selectedMains.has(main.id);
          const isExpanded = expandedMains.has(main.id);

          return (
            <div
              key={main.id}
              className={`overflow-hidden rounded-xl border transition ${
                isMainSelected
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-zinc-700 bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center gap-2 px-3 py-3">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name={mode === "craftsman" ? "categories" : undefined}
                    value={main.id}
                    checked={isMainSelected}
                    onChange={(e) => toggleMain(main.id, e.target.checked)}
                    className="accent-amber-500"
                  />
                  {mode === "job" && isMainSelected && (
                    <input type="hidden" name="category" value={main.id} />
                  )}
                  <span className="text-sm font-medium text-zinc-100">
                    {main.label}
                  </span>
                </label>

                {isMainSelected && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(main.id)}
                    className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                    aria-expanded={isExpanded}
                    aria-label={`${main.label} al-tevékenységek`}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              <div
                className={`grid transition-all duration-300 ease-out ${
                  isMainSelected && isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-zinc-700/80 px-3 pb-3 pt-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {main.subActivities.map((sub) => (
                        <label
                          key={sub.key}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-100"
                        >
                          <input
                            type="checkbox"
                            name="sub_categories"
                            value={sub.key}
                            checked={selectedSubs.has(sub.key)}
                            onChange={(e) =>
                              toggleSub(sub.key, e.target.checked)
                            }
                            disabled={!isMainSelected}
                            className="accent-amber-500"
                          />
                          {sub.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
