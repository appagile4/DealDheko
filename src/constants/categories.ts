export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // vector icon fallback
  image: any;  // require asset
  description: string;
  subCategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "cars",
    name: "Cars",
    slug: "cars",
    icon: "car-outline",
    image: require("../../assets/categories/cars.png"),
    description: "Buy and sell verified used cars, luxury vehicles, and hatchbacks across Nepal.",
    subCategories: [
      { id: "cars-all", name: "All Cars", slug: "all-cars" },
      { id: "sedans", name: "Sedans", slug: "sedans" },
      { id: "suvs", name: "SUVs & 4x4", slug: "suvs" },
      { id: "hatchbacks", name: "Hatchbacks", slug: "hatchbacks" },
      { id: "electric-cars", name: "Electric Cars (EV)", slug: "electric-cars" },
      { id: "luxury-cars", name: "Luxury Cars", slug: "luxury-cars" },
      { id: "car-accessories", name: "Spare Parts & Accessories", slug: "car-accessories" },
    ],
  },
  {
    id: "bikes",
    name: "Bikes & Scooters",
    slug: "bikes",
    icon: "bicycle-outline",
    image: require("../../assets/categories/bikes.png"),
    description: "Explore Royal Enfield, sportbikes, electric scooters, and commuter motorcycles.",
    subCategories: [
      { id: "motorcycles", name: "Motorcycles", slug: "motorcycles" },
      { id: "scooters", name: "Scooters", slug: "scooters" },
      { id: "electric-bikes", name: "Electric Bikes & Scooters", slug: "electric-bikes" },
      { id: "bicycles", name: "Bicycles", slug: "bicycles" },
      { id: "bike-spares", name: "Spare Parts & Helmets", slug: "bike-spares" },
    ],
  },
  {
    id: "properties",
    name: "Properties",
    slug: "properties",
    icon: "home-outline",
    image: require("../../assets/categories/properties.png"),
    description: "Houses, apartments, commercial shops, and residential plots for sale and rent.",
    subCategories: [
      { id: "for-sale-houses", name: "For Sale: Houses & Villas", slug: "for-sale-houses" },
      { id: "for-sale-apartments", name: "For Sale: Apartments & Flats", slug: "for-sale-apartments" },
      { id: "for-rent-houses", name: "For Rent: Houses & Rooms", slug: "for-rent-houses" },
      { id: "for-rent-apartments", name: "For Rent: Apartments", slug: "for-rent-apartments" },
      { id: "lands-plots", name: "Lands & Plots", slug: "lands-plots" },
      { id: "commercial-property", name: "Commercial Space & Shops", slug: "commercial-property" },
    ],
  },
  {
    id: "electronics",
    name: "Electronics & Appliances",
    slug: "electronics",
    icon: "tv-outline",
    image: require("../../assets/categories/electronics.png"),
    description: "LED TVs, audio systems, laptops, cameras, refrigerators, and kitchen appliances.",
    subCategories: [
      { id: "laptops-computers", name: "Laptops & Computers", slug: "laptops-computers" },
      { id: "tv-video-audio", name: "TVs, Video & Audio", slug: "tv-video-audio" },
      { id: "kitchen-appliances", name: "Kitchen & Home Appliances", slug: "kitchen-appliances" },
      { id: "cameras-lenses", name: "Cameras & Lenses", slug: "cameras-lenses" },
      { id: "gaming-consoles", name: "Gaming Consoles & Games", slug: "gaming-consoles" },
      { id: "ac-heaters", name: "Air Conditioners & Geysers", slug: "ac-heaters" },
    ],
  },
  {
    id: "mobiles",
    name: "Mobiles & Tablets",
    slug: "mobiles",
    icon: "phone-portrait-outline",
    image: require("../../assets/categories/mobiles.png"),
    description: "iPhones, Samsung Galaxy, accessories, smartwatches, and iPad tablets.",
    subCategories: [
      { id: "mobile-phones", name: "Mobile Phones", slug: "mobile-phones" },
      { id: "tablets-ipads", name: "Tablets & iPads", slug: "tablets-ipads" },
      { id: "smartwatches", name: "Smartwatches & Wearables", slug: "smartwatches" },
      { id: "mobile-accessories", name: "Accessories & Chargers", slug: "mobile-accessories" },
    ],
  },
  {
    id: "commercial-vehicles",
    name: "Commercial Vehicles",
    slug: "commercial-vehicles",
    icon: "bus-outline",
    image: require("../../assets/categories/commercial-vehicles.png"),
    description: "Trucks, pickups, commercial vans, heavy machinery, and bus spares.",
    subCategories: [
      { id: "trucks-pickups", name: "Trucks & Pickups", slug: "trucks-pickups" },
      { id: "vans-buses", name: "Vans & Buses", slug: "vans-buses" },
      { id: "tractors-machinery", name: "Tractors & Agricultural Machinery", slug: "tractors-machinery" },
      { id: "commercial-spares", name: "Spare Parts", slug: "commercial-spares" },
    ],
  },
  {
    id: "furniture",
    name: "Furniture & Decor",
    slug: "furniture",
    icon: "bed-outline",
    image: require("../../assets/categories/furniture.png"),
    description: "Sofa sets, dining tables, beds, wardrobes, office furniture, and home decor.",
    subCategories: [
      { id: "sofa-dining", name: "Sofa Sets & Dining Tables", slug: "sofa-dining" },
      { id: "beds-wardrobes", name: "Beds & Wardrobes", slug: "beds-wardrobes" },
      { id: "home-decor", name: "Home Decor & Garden", slug: "home-decor" },
      { id: "office-furniture", name: "Office Furniture", slug: "office-furniture" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion & Beauty",
    slug: "fashion",
    icon: "shirt-outline",
    image: require("../../assets/categories/fashion.png"),
    description: "Clothing, traditional wear, footwear, watches, jewelry, and beauty cosmetics.",
    subCategories: [
      { id: "men-fashion", name: "Men's Clothing & Shoes", slug: "men-fashion" },
      { id: "women-fashion", name: "Women's Clothing & Traditional Wear", slug: "women-fashion" },
      { id: "watches-jewelry", name: "Watches & Jewelry", slug: "watches-jewelry" },
      { id: "footwear", name: "Footwear", slug: "footwear" },
      { id: "bags-luggage", name: "Bags & Luggage", slug: "bags-luggage" },
    ],
  },
  {
    id: "pets",
    name: "Pets & Animals",
    slug: "pets",
    icon: "paw-outline",
    image: require("../../assets/categories/pets.png"),
    description: "Dogs, cats, birds, aquarium fishes, pet food, and grooming accessories.",
    subCategories: [
      { id: "dogs-puppies", name: "Dogs & Puppies", slug: "dogs-puppies" },
      { id: "cats-kittens", name: "Cats & Kittens", slug: "cats-kittens" },
      { id: "birds-fishes", name: "Birds & Aquarium Fishes", slug: "birds-fishes" },
      { id: "pet-food-supplies", name: "Pet Food & Supplies", slug: "pet-food-supplies" },
    ],
  },
  {
    id: "jobs",
    name: "Jobs & Services",
    slug: "jobs",
    icon: "briefcase-outline",
    image: require("../../assets/categories/jobs.png"),
    description: "Full-time, part-time jobs, internships, home repairs, and freelancer services.",
    subCategories: [
      { id: "it-software-jobs", name: "IT & Software Jobs", slug: "it-software-jobs" },
      { id: "sales-marketing", name: "Sales & Marketing", slug: "sales-marketing" },
      { id: "office-admin", name: "Office Assistant & Admin", slug: "office-admin" },
      { id: "home-services", name: "Home Repairs & Electricians", slug: "home-services" },
      { id: "drivers-delivery", name: "Drivers & Delivery Staff", slug: "drivers-delivery" },
    ],
  },
];
