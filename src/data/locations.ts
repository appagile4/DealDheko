export interface CityLocation {
  id: string;
  name: string;
  state: string;
  popular?: boolean;
}

export const POPULAR_CITIES: CityLocation[] = [
  { id: "all-nepal", name: "All Nepal", state: "Nepal", popular: true },
  { id: "kathmandu", name: "Kathmandu", state: "Bagmati Province", popular: true },
  { id: "pokhara", name: "Pokhara", state: "Gandaki Province", popular: true },
  { id: "lalitpur", name: "Lalitpur", state: "Bagmati Province", popular: true },
  { id: "bhaktapur", name: "Bhaktapur", state: "Bagmati Province", popular: true },
  { id: "bharatpur", name: "Bharatpur (Chitwan)", state: "Bagmati Province", popular: true },
  { id: "biratnagar", name: "Biratnagar", state: "Koshi Province", popular: true },
  { id: "birgunj", name: "Birgunj", state: "Madhesh Province", popular: true },
  { id: "butwal", name: "Butwal", state: "Lumbini Province", popular: true },
  { id: "dharan", name: "Dharan", state: "Koshi Province", popular: true },
  { id: "hetauda", name: "Hetauda", state: "Bagmati Province", popular: false },
  { id: "nepalgunj", name: "Nepalgunj", state: "Lumbini Province", popular: false },
  { id: "dhangadhi", name: "Dhangadhi", state: "Sudurpashchim Province", popular: false },
  { id: "delhi", name: "Delhi NCR", state: "India", popular: false },
  { id: "mumbai", name: "Mumbai", state: "India", popular: false },
];

export const INDIAN_STATES: string[] = [
  "Bagmati Province",
  "Gandaki Province",
  "Koshi Province",
  "Lumbini Province",
  "Madhesh Province",
  "Karnali Province",
  "Sudurpashchim Province",
  "Delhi NCR",
  "Maharashtra",
  "Karnataka",
];
