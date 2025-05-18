export const ROLES = {
  ADMIN: "admin",
  VENDOR: "vendor",
  PARENT: "parent",
  ALL: "all",
};

export const API_BASE_URL = "http://dev-env.eba-w6szmmmp.us-east-1.elasticbeanstalk.com";
  // "https://nestschoolbackend-production.up.railway.app";

export const PAYMENT_MODE = {
  credit_card: "Credit/Debit Card",
  upi: "UPI",
  net_banking: "Net Banking",
  na: "Not Applicable",
};

export const studentTypeList = [
  { label: "New", key: "New" },
  { label: "Existing", key: "Existing" },
  { label: "Hostel", key: "Hostel" },
];

export const genderList = [
  { label: "Male", key: "Male" },
  { label: "Female", key: "Female" },
];

export const boardingStatusList = [
  { key: "Yes", label: "Yes" },
  { key: "No", label: "No" },
];

export const houseList = [
  { key: "Dragons", label: "Dragons" },
  { key: "Griffins", label: "Griffins" },
  { key: "Sphinx", label: "Sphinx" },
  { key: "Pegasus", label: "Pegasus" },
];

export const classList = [
  { key: "Nursery", label: "Nursery" },
  { key: "PP1", label: "PP1" },
  { key: "PP2", label: "PP2" },
  { key: "I", label: "I" },
  { key: "II", label: "II" },
  { key: "III", label: "III" },
  { key: "IV", label: "IV" },
  { key: "V", label: "V" },
  { key: "VI", label: "VI" },
  { key: "VII", label: "VII" },
  { key: "VIII", label: "VIII" },
  { key: "IX", label: "IX" },
  { key: "X", label: "X" },
  { key: "XI", label: "XI" },
  { key: "XII", label: "XII" },
];

export const sectionList = [
  { label: "A", key: "A" },
  { label: "A (25-26)", key: "A (25-26)" },
  { label: "B", key: "B" },
  { label: "B (25-26)", key: "B (25-26)" },
  { label: "C", key: "C" },
  { label: "C (25-26)", key: "C (25-26)" },
  { label: "D", key: "D" },
  { label: "D (25-26)", key: "D (25-26)" },
  { label: "E", key: "E" },
  { label: "F", key: "F" },
  { label: "G", key: "G" },
  { label: "H", key: "H" },
  { label: "I", key: "I" },
  { label: "J", key: "J" },
  { label: "K", key: "K" },
  { label: "L", key: "L" },
  { label: "M", key: "M" },
  { label: "N", key: "N" },
  { label: "NP", key: "NP" },
  { label: "O", key: "O" },
  { label: "P", key: "P" },
  { label: "Q", key: "Q" },
  { label: "R", key: "R" },
];

export const campusList = [
  { label: "Kollur", key: "Kollur" },
  { label: "Nanakram Guda", key: "Nanakram Guda" },
];

export const SUPORT_ATTACHMENT_URL =
  "https://api.cloudinary.com/v1_1/dwgfx9feh/image/upload";

export const SHIPPING_CHARGES = 500;

export const sizeOptions = {
  "TGS PP Uni CC Tee - White": ["P3", "P4", "P5", "P6", "P8", "P10", "P12", "P14"],
  "RAP PP Boys w/o Zip Shorts - Printed": ["16", "18", "20", "22", "24", "26", "28", "30"],
  "RAP PP Girls String Skirt - Printed": ["16", "18", "20", "22", "24", "26", "28", "30"],
  "TGS Uni Shirt - White": ["3", "4", "5", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28"],
  "RAP Boys YP KE Shorts - Black Twill": ["18", "18L", "20", "20L", "22", "22L", "24", "24L", "26", "26L", "28", "30", "32", "34", "36"],
  "RAP Boys YP EW Trouser - Black": ["20", "22", "24", "26", "26L", "28", "28L", "30", "30L", "32", "34", "36", "38", "40", "42", "44"],
  "RAP Girls Yel Fan IE Skirt - Black Twill": ["2", "2L", "3S", "3", "3L", "4S", "4", "4L", "4XL", "5S", "5", "5L", "6S", "6", "6L", "6XL", "7S", "7", "7L", "7XL","8S", "8", "8L", "8XL", "9S", "9", "9L", "9XL", "10", "10L", "11", "11L", "12", "12L", "14", "14L"],
  "RAP Girls YP SE Trouser - Black Twill": ["24", "26", "26L", "28", "28L", "30", "30L", "32", "34", "36", "38", "40", "42", "44"],
  "TGS Uni V Collar Slate Tee": ["5", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24"],
  "RAP Uni SD Slate TP Shorts - Black Dia": ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL"],
  "RAP Uni SD Slate TP Track - Black Dia": ["19", "19L", "22", "22L", "25S", "25", "25L", "28S", "28", "28L", "31S", "31", "31L", "34S", "34", "34L", "37S", "37", "37L", "40", "43"],
  "TGS Uni FS Puff Hoody - Yellow": ["3", "4", "5", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24"],
  "TGS PP Uni Star Raglan Hoody - Black": ["P3", "P4", "P5", "P6", "P8", "P10", "P12"],
  "TGS Uni Printed Zip Hoody - Black": ["3", "4", "5", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26"],
}