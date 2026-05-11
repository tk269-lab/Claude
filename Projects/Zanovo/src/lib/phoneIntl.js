import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
} from "libphonenumber-js";

const regionDisplayNames =
  typeof Intl !== "undefined" ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

export const PHONE_COUNTRY_OPTIONS = getCountries()
  .map((iso) => ({
    iso,
    dial: getCountryCallingCode(iso),
    label: regionDisplayNames?.of(iso) ?? iso,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export function countryLabel(iso) {
  return PHONE_COUNTRY_OPTIONS.find((c) => c.iso === iso)?.label ?? iso;
}

/** @returns {string} error message or "" if valid */
export function validateNationalPhone(national, countryIso) {
  const trimmed = (national || "").trim();
  if (!trimmed) return "Please enter your phone number.";
  const place = countryLabel(countryIso);
  const lenCode = validatePhoneNumberLength(trimmed, countryIso);
  if (lenCode === "NOT_A_NUMBER") {
    return "Please enter a valid phone number (digits only).";
  }
  if (lenCode === "INVALID_COUNTRY") {
    return "Please choose a valid country code.";
  }
  if (lenCode === "TOO_SHORT") {
    return `Phone number is too short for ${place}. Enter the full national number (with area code if you normally dial it).`;
  }
  if (lenCode === "TOO_LONG") {
    return `Phone number is too long for ${place}. Check the number of digits for ${place}.`;
  }
  if (lenCode === "INVALID_LENGTH") {
    return `That number of digits is not valid for ${place}. Adjust your number to match ${place} phone formats.`;
  }
  if (lenCode) {
    return `Please enter a phone number that matches ${place} formats.`;
  }
  const parsed = parsePhoneNumberFromString(trimmed, countryIso);
  if (!parsed?.isValid()) {
    return `Please enter a valid phone number for ${place}.`;
  }
  return "";
}

export function nationalToE164(national, countryIso) {
  const parsed = parsePhoneNumberFromString((national || "").trim(), countryIso);
  return parsed?.number ?? null;
}
