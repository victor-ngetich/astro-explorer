"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";

const facets = [
  {
    id: "object-type",
    name: "Object Type",
    options: [
      { value: "star", label: "Star" },
      { value: "planet", label: "Planet" },
      { value: "dwarf-planet", label: "Dwarf Planet" },
      { value: "moon", label: "Moon" },
      { value: "asteroid", label: "Asteroid" },
      { value: "comet", label: "Comet" },
      { value: "nebula", label: "Nebula" },
      { value: "galaxy", label: "Galaxy" },
      { value: "star-cluster", label: "Star Cluster" },
      { value: "black-hole", label: "Black Hole" },
    ],
  },
  {
    id: "visibility",
    name: "Visibility",
    options: [
      { value: "naked-eye", label: "Naked Eye" },
      { value: "binoculars", label: "Binoculars" },
      { value: "small-telescope", label: "Small Telescope" },
      { value: "large-telescope", label: "Large Telescope" },
      { value: "space-telescope", label: "Space Telescope" },
    ],
  },
  {
    id: "viewing-season",
    name: "Viewing Season",
    options: [
      { value: "spring", label: "Spring" },
      { value: "summer", label: "Summer" },
      { value: "fall", label: "Fall" },
      { value: "winter", label: "Winter" },
      { value: "varies", label: "Varies" },
      { value: "year-round", label: "Year-Round" },
    ],
  },
  {
    id: "magnitude",
    name: "Brightness",
    options: [
      { value: "extremely-bright", label: "Extremely Bright (-1 or brighter)" },
      { value: "very-bright", label: "Very Bright (0 to 2)" },
      { value: "bright", label: "Bright (2 to 4)" },
      { value: "moderate", label: "Moderate (4 to 6)" },
      { value: "faint", label: "Faint (6 to 8)" },
      { value: "very-faint", label: "Very Faint (8 or dimmer)" },
    ],
  },
  {
    id: "distance",
    name: "Distance Range",
    options: [
      { value: "solar-system", label: "Within Solar System" },
      { value: "within-10-ly", label: "Within 10 Light Years" },
      { value: "within-100-ly", label: "Within 100 Light Years" },
      { value: "within-1000-ly", label: "Within 1,000 Light Years" },
      { value: "within-milky-way", label: "Within Milky Way" },
      { value: "beyond-milky-way", label: "Beyond Milky Way" },
    ],
  },
  {
    id: "discovery-era",
    name: "Discovery Era",
    options: [
      { value: "ancient", label: "Ancient (Pre-1600)" },
      { value: "early-telescopic", label: "Early Telescopic (1600-1800)" },
      { value: "classical", label: "Classical (1801-1900)" },
      { value: "modern", label: "Modern (1901-2000)" },
      { value: "contemporary", label: "Contemporary (2001-Present)" },
    ],
  },
];

export default function Dashboard() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    "object-type": [],
    magnitude: [],
    "viewing-season": [],
    distance: [],
    "discovery-era": [],
    visibility: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [originalCelestialObjects, setOriginalCelestialObjects] = useState([]);
  const [filteredCelestialObjects, setFilteredCelestialObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [open, setOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 items per page (3x3 grid)

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCelestialObjects.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCelestialObjects.length / itemsPerPage);

  const formatMetadataLabel = (key) => {
    return key
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatMetadataValue = (value) => {
    if (typeof value === "string") {
      return value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return value;
  };
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categorizeDistance = (distance_ly) => {
    if (distance_ly < 1) {
      return "solar-system";
    } else if (distance_ly <= 10) {
      return "within-10-ly";
    } else if (distance_ly <= 100) {
      return "within-100-ly";
    } else if (distance_ly <= 1000) {
      return "within-1000-ly";
    } else if (distance_ly <= 100000) {
      return "within-milky-way";
    } else {
      return "beyond-milky-way";
    }
  };

  useEffect(() => {
    axios
      .get("/data/celestial_objects.json")
      .then((response) => {
        // Add distance range to metadata for each object
        const processedData = response.data.map((obj) => ({
          ...obj,
          metadata: {
            ...obj.metadata,
            distance: categorizeDistance(obj.distance_ly),
          },
        }));

        // Sort the data by name in ascending order
        const sortedData = processedData.sort((a, b) => a.name.localeCompare(b.name));
        setOriginalCelestialObjects(sortedData);
        setFilteredCelestialObjects(sortedData);
      })
      .catch((error) => {
        console.error("Error exploring space:", error);
      });
  }, []);

  useEffect(() => {
    const searchResults = originalCelestialObjects.filter((celestial_object) => {
      // Helper function to get label for a metadata value
      const getLabel = (facetId, value) => {
        const facet = facets.find((f) => f.id === facetId);
        if (!facet) return value;
        const option = facet.options.find((o) => o.value === value);
        return option ? option.label : value;
      };

      const searchMatch =
        searchQuery === "" ||
        celestial_object.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (celestial_object.galaxy || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.entries(celestial_object.metadata).some(([key, value]) => {
          const label = getLabel(key, value);
          return label.toLowerCase().includes(searchQuery.toLowerCase());
        });

      const filterMatch = Object.entries(selectedFilters).every(([key, values]) => {
        if (values.length === 0) return true;
        return values.includes(celestial_object.metadata[key]);
      });

      return searchMatch && filterMatch;
    });

    const sortedResults = searchResults.sort((a, b) => a.name.localeCompare(b.name));
    setFilteredCelestialObjects(sortedResults);
  }, [searchQuery, selectedFilters, originalCelestialObjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilters]);

  const handleFilterChange = (sectionId, value, checked) => {
    // Update checked state for the checkbox
    setCheckedItems((prev) => ({
      ...prev,
      [`${sectionId}-${value}`]: checked,
    }));

    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [sectionId]: checked ? [...prev[sectionId], value] : prev[sectionId].filter((item) => item !== value),
      };
      return newFilters;
    });

    setActiveFilters((prev) => {
      const section = facets.find((f) => f.id === sectionId);
      const option = section.options.find((o) => o.value === value);

      if (checked) {
        return [
          ...prev,
          {
            section: sectionId,
            value: value,
            label: option.label,
          },
        ];
      } else {
        return prev.filter((filter) => !(filter.section === sectionId && filter.value === value));
      }
    });
  };

  const handleRemoveFilter = (sectionId, value) => {
    // Update checkbox checked state
    setCheckedItems((prev) => ({
      ...prev,
      [`${sectionId}-${value}`]: false,
    }));

    // Update checkboxes state
    setSelectedFilters((prev) => {
      const newFilters = {
        ...prev,
        [sectionId]: prev[sectionId].filter((item) => item !== value),
      };
      return newFilters;
    });

    // Update active filters
    setActiveFilters((prev) => {
      const newFilters = prev.filter((filter) => !(filter.section === sectionId && filter.value === value));
      return newFilters;
    });
  };

  const getFilterCount = (sectionId, optionValue) => {
    // Helper function to get label for a metadata value
    const getLabel = (facetId, value) => {
      const facet = facets.find((f) => f.id === facetId);
      if (!facet) return value;
      const option = facet.options.find((o) => o.value === value);
      return option ? option.label : value;
    };

    return originalCelestialObjects.filter((celestial_object) => {
      // Check if matches current search
      const searchMatch =
        searchQuery === "" ||
        celestial_object.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (celestial_object.galaxy || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.entries(celestial_object.metadata).some(([key, value]) => {
          const label = getLabel(key, value);
          return label.toLowerCase().includes(searchQuery.toLowerCase());
        });

      // Check if matches this filter value
      const matchesFilter = celestial_object.metadata[sectionId] === optionValue;

      // Check if matches other currently selected filters
      const matchesOtherFilters = Object.entries(selectedFilters).every(([key, values]) => {
        if (key === sectionId || values.length === 0) return true;
        return values.includes(celestial_object.metadata[key]);
      });

      return searchMatch && matchesFilter && matchesOtherFilters;
    }).length;
  };

  // Console print all objects
  const printAllCelestialObjectNames = () => {
    const namesString = originalCelestialObjects.map((object) => `${object.name}`).join(" , ");

    console.log("All Celestial Objects:");
    console.log(namesString);
  };

  useEffect(() => {
    if (originalCelestialObjects.length > 0) {
      printAllCelestialObjectNames();
    }
  }, [originalCelestialObjects]);

  return (
    <div className="bg-white">
      <div>
        {/* Mobile filter dialog */}
        <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
          />

          <div className="fixed inset-0 z-40 flex">
            <DialogPanel
              transition
              className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
            >
              <div className="flex items-center justify-between px-4">
                <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="relative -mr-2 flex size-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                >
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="size-6" />
                </button>
              </div>

              {/* Filters */}
              <form className="mt-4">
                {facets.map((section) => (
                  <Disclosure key={section.name} as="div" className="border-t border-gray-200 py-1">
                    <fieldset>
                      <legend className="w-full px-2">
                        <DisclosureButton className="group flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                          <span className="text-sm font-medium text-gray-900">{section.name}</span>
                          <span className="ml-6 flex h-7 items-center">
                            <ChevronDownIcon aria-hidden="true" className="size-5 rotate-0 transform group-data-[open]:-rotate-180" />
                          </span>
                        </DisclosureButton>
                      </legend>
                      <DisclosurePanel className="px-4 pb-2 pt-4">
                        <div className="space-y-2">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex gap-3">
                              <div className="flex h-5 shrink-0 items-center justify-between">
                                <div className="flex gap-3">
                                  <div className="flex h-5 shrink-0 items-center">
                                    <div className="group grid size-4 grid-cols-1">
                                      <input
                                        value={option.value}
                                        id={`${section.id}-${optionIdx}-mobile`}
                                        name={`${section.id}[]`}
                                        type="checkbox"
                                        checked={checkedItems[`${section.id}-${option.value}`] || false}
                                        onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                        className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                      />
                                      <svg
                                        fill="none"
                                        viewBox="0 0 14 14"
                                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                                      >
                                        <path
                                          d="M3 8L6 11L11 3.5"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="opacity-0 group-has-[:checked]:opacity-100"
                                        />
                                        <path
                                          d="M3 7H11"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <label htmlFor={`${section.id}-${optionIdx}-mobile`} className="text-sm text-gray-500">
                                {option.label}
                              </label>
                              <span className="text-sm text-gray-400">({getFilterCount(section.id, option.value)})</span>
                            </div>
                          ))}
                        </div>
                      </DisclosurePanel>
                    </fieldset>
                  </Disclosure>
                ))}
              </form>
            </DialogPanel>
          </div>
        </Dialog>

        <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
          <div className="border-b border-gray-200 pb-4 pt-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <h1
                onClick={() => (window.location.href = "/")}
                className="text-xl text-center sm:text-2xl font-bold tracking-tight text-gray-900 hover:opacity-80 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                Astronomical Objects
              </h1>
              {/* Search */}
              <div className="w-full sm:w-96">
                <div className="grid grid-cols-1 items-center justify-center">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, galaxy, or properties"
                    className="col-start-1 row-start-1 block w-full rounded-3xl bg-white py-1 sm:py-1.5 pl-10 pr-3 text-sm sm:text-sm/6 text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:pl-9"
                  />
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-inherit">
            {/* Filters */}
            <section aria-labelledby="filter-heading">
              <h2 id="filter-heading" className="sr-only">
                Filters
              </h2>

              {/* Active filters */}
              <div className="bg-inherit">
                <div className="mx-auto max-w-7xl px-0 py-3 sm:flex sm:items-center sm:px-0 lg:px-0">
                  <div className="mt-2 sm:ml-0 sm:mt-0">
                    <div className="-m-1 flex flex-wrap items-center">
                      {activeFilters.map((activeFilter) => (
                        <span
                          key={`${activeFilter.section}-${activeFilter.value}`}
                          className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-blue-600 py-1 pl-3 pr-2 text-sm font-medium text-white"
                        >
                          <span>{activeFilter.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFilter(activeFilter.section, activeFilter.value)}
                            className="ml-1 inline-flex size-4 shrink-0 rounded-full p-1 text-white hover:bg-gray-100 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove filter for {activeFilter.label}</span>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 8 8" className="size-2">
                              <path d="M1 1l6 6m0-6L1 7" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="pb-8 pt-4 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
            <aside>
              <h2 className="sr-only">Filters</h2>

              <button type="button" onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center lg:hidden">
                <span className="text-sm font-medium text-gray-700">Filters</span>
                <PlusIcon aria-hidden="true" className="ml-1 size-5 shrink-0 text-gray-400" />
              </button>

              <div className="hidden lg:block">
                <form className="space-y-4 divide-y divide-gray-200 max-h-[69rem] overflow-y-auto pr-6 py-4 border-y">
                  {facets.map((section, sectionIdx) => (
                    <div key={section.name} className={sectionIdx === 0 ? null : "pt-4"}>
                      <fieldset>
                        <legend className="block text-sm font-bold text-gray-900">{section.name}</legend>
                        <div className="space-y-3 pt-6">
                          {section.options.map((option, optionIdx) => (
                            <div key={option.value} className="flex items-center justify-between">
                              <div className="flex gap-3">
                                <div className="flex h-5 shrink-0 items-center">
                                  <div className="group grid size-4 grid-cols-1">
                                    <input
                                      // defaultValue={option.value}
                                      value={option.value}
                                      id={`${section.id}-${optionIdx}`}
                                      name={`${section.id}[]`}
                                      type="checkbox"
                                      checked={checkedItems[`${section.id}-${option.value}`] || false}
                                      onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                      className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-blue-600 checked:bg-blue-600 indeterminate:border-blue-600 indeterminate:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                                    />
                                    <svg
                                      fill="none"
                                      viewBox="0 0 14 14"
                                      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                                    >
                                      <path
                                        d="M3 8L6 11L11 3.5"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="opacity-0 group-has-[:checked]:opacity-100"
                                      />
                                      <path
                                        d="M3 7H11"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="opacity-0 group-has-[:indeterminate]:opacity-100"
                                      />
                                    </svg>
                                  </div>
                                </div>
                                <label htmlFor={`${section.id}-${optionIdx}`} className="text-sm text-gray-600">
                                  {option.label}
                                </label>
                                <span className="text-sm text-gray-400">({getFilterCount(section.id, option.value)})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  ))}
                </form>
              </div>
            </aside>

            <section aria-labelledby="celestial_object-heading" className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
              <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                {currentItems.map((celestial_object) => (
                  <li
                    key={celestial_object.id}
                    className="relative bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => {
                      setSelectedObject(celestial_object);
                      setOpen(true);
                    }}
                  >
                    <div className="group overflow-hidden rounded-t-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                      <Image
                        src={celestial_object.imageSrc}
                        className="pointer-events-none aspect-[10/7] object-cover group-hover:opacity-75"
                        width={9999}
                        height={9999}
                        alt="Some celestial body"
                      />
                    </div>
                    <div className="m-2.5">
                      <p className="text-base font-semibold text-gray-900">{celestial_object.name}</p>
                      {/* Divider */}
                      <div className="relative py-1">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-end">
                        <p className="text-sm font-medium text-gray-600">{celestial_object.description}</p>
                        <p className="text-sm font-medium italic text-gray-600">Galaxy: {celestial_object.galaxy || "None"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </section>
          </div>
        </main>
        {/* Modal */}
        <Dialog open={open} onClose={setOpen} className="relative z-10">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          />

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
              >
                {selectedObject && (
                  <div>
                    <div className="aspect-[16/9] relative">
                      <Image src={selectedObject.imageSrc} alt={selectedObject.name} fill className="object-cover" />
                    </div>
                    <div className="px-4 pb-4 pt-5 sm:p-3">
                      <DialogTitle as="h3" className="text-2xl font-semibold text-gray-900 text-center mb-1">
                        {selectedObject.name}
                      </DialogTitle>

                      {/* Basic Information */}
                      <div className="mb-6 border-b border-gray-200 pb-4">
                        {/* <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4> */}
                        <p className="text-base text-gray-600 text-center">{selectedObject.description}</p>
                      </div>

                      {/* Primary Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2 sm:col-span-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            Galaxy: <span className="font-normal text-gray-600">{selectedObject.galaxy || "None"}</span>
                          </h4>
                        </div>
                        {selectedObject.distance_ly && (
                          <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                              Distance:{" "}
                              <span className="font-normal text-gray-600">
                                {selectedObject.distance_ly.toLocaleString()} light years
                              </span>
                            </h4>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(selectedObject.metadata).map(([key, value]) => (
                          <div key={key} className="py-1 rounded-lg">
                            <h5 className="text-sm font-semibold text-gray-900">
                              {formatMetadataLabel(key)}:{" "}
                              <span className="font-normal text-gray-600">{formatMetadataValue(value)}</span>
                            </h5>
                          </div>
                        ))}
                      </div>

                      {/* Close Button */}
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
