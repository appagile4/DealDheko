import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Advertisement from "../models/Advertisement.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  // 1. Create or find sample seller
  let seller = await User.findOne({ email: "seller.vikram@dealdheko.com" });
  if (!seller) {
    seller = await User.create({
      name: "Vikram Sharma",
      email: "seller.vikram@dealdheko.com",
      password: "SellerPassword123!",
      phone: "+977 98412 34567",
      city: "Kathmandu",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      about: "Top-rated vehicle and electronics seller based in Kathmandu.",
    });
    console.log("✓ Sample verified seller created:", seller.email);
  }

  // 2. Clear existing test ads if any, to prevent duplicates
  await Advertisement.deleteMany({ seller: seller._id });

  const sampleAds = [
    // PENDING ADS (Waiting for Superadmin Approval)
    {
      title: "Royal Enfield Classic 350 Stealth Black 2023",
      slug: "royal-enfield-classic-350-stealth-black-2023-7841",
      description: "Well maintained Royal Enfield Classic 350 Stealth Black color. Single owner driven, only 6,500 km on the odometer. Serviced exclusively at official service centers. Tax cleared until 2082. All paperwork ready.",
      price: 365000,
      category: "bikes",
      subCategory: "motorcycles",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80" },
      ],
      location: {
        state: "Bagmati",
        city: "Kathmandu",
        area: "Baneshwor",
        pincode: "44600",
      },
      seller: seller._id,
      sellerContact: {
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
      },
      attributes: {
        Brand: "Royal Enfield",
        Year: "2023",
        Kilometers: "6500",
        Condition: "Used",
      },
      status: "pending", // PENDING APPROVAL
      isFeatured: false,
    },
    {
      title: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
      slug: "apple-iphone-15-pro-max-256gb-natural-titanium-9321",
      description: "Authentic iPhone 15 Pro Max 256GB in pristine condition with 98% battery health. Comes with original box, braided USB-C cable, and premium screen protector installed from day 1.",
      price: 155000,
      category: "mobiles",
      subCategory: "smartphones",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80" },
        { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" },
      ],
      location: {
        state: "Bagmati",
        city: "Kathmandu",
        area: "Thamel",
        pincode: "44600",
      },
      seller: seller._id,
      sellerContact: {
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
      },
      attributes: {
        Brand: "Apple",
        Storage: "256 GB",
        BatteryHealth: "98%",
        Condition: "Used",
      },
      status: "pending", // PENDING APPROVAL
      isFeatured: false,
    },

    // APPROVED ADS (Live on Marketplace)
    {
      title: "Hyundai Grand i10 Magna 2021 Mint Condition",
      slug: "hyundai-grand-i10-magna-2021-mint-condition-4512",
      description: "Single-hand driven Hyundai Grand i10 Magna petrol variant. Power steering, dual airbags, touchscreen infotainment system with reverse camera. Regularly serviced, comprehensive insurance valid.",
      price: 1850000,
      category: "cars",
      subCategory: "hatchback",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" },
        { url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80" },
      ],
      location: {
        state: "Bagmati",
        city: "Kathmandu",
        area: "Koteshwor",
        pincode: "44600",
      },
      seller: seller._id,
      sellerContact: {
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
      },
      attributes: {
        Brand: "Hyundai",
        Year: "2021",
        Fuel: "Petrol",
        Transmission: "Manual",
        Condition: "Used",
      },
      status: "approved",
      isFeatured: true,
      approvedAt: new Date(),
    },
    {
      title: "TVS Apache RTR 160 4V Single Disc Glossy Black",
      slug: "tvs-apache-rtr-160-4v-single-disc-glossy-black-6218",
      description: "Super smooth engine, digital instrument cluster with Bluetooth connectivity. Excellent mileage around 45 kmpl in Kathmandu traffic. Tubeless tires with plenty of tread remaining.",
      price: 215000,
      category: "bikes",
      subCategory: "motorcycles",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80" },
      ],
      location: {
        state: "Gandaki",
        city: "Pokhara",
        area: "Lakeside",
        pincode: "33700",
      },
      seller: seller._id,
      sellerContact: {
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
      },
      attributes: {
        Brand: "TVS",
        Year: "2022",
        Condition: "Used",
      },
      status: "approved",
      isFeatured: true,
      approvedAt: new Date(),
    },
    {
      title: "Sony Bravia 55 inch 4K Ultra HD Smart LED Google TV",
      slug: "sony-bravia-55-inch-4k-ultra-hd-smart-led-google-tv-8721",
      description: "Stunning 4K display with Triluminos Pro, Dolby Vision and Atmos sound. Purchased 10 months ago, bill and warranty card available. Selling due to relocation.",
      price: 88000,
      category: "electronics",
      subCategory: "televisions",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80" },
      ],
      location: {
        state: "Bagmati",
        city: "Lalitpur",
        area: "Patan",
        pincode: "44700",
      },
      seller: seller._id,
      sellerContact: {
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
      },
      attributes: {
        Brand: "Sony",
        ScreenSize: "55 inches",
        Resolution: "4K UHD",
      },
      status: "approved",
      isFeatured: true,
      approvedAt: new Date(),
    },
    {
      title: "Modern 2BHK Apartment for Rent in Jhamsikhel Lalitpur",
      slug: "modern-2bhk-apartment-for-rent-in-jhamsikhel-lalitpur-3419",
      description: "Fully furnished 2-bedroom apartment with modular kitchen, private balcony, 24/7 solar backup, and dedicated car parking. Walking distance from major cafes and restaurants.",
      price: 65000,
      category: "properties",
      subCategory: "apartments",
      condition: "New",
      images: [
        { url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" },
      ],
      location: {
        state: "Bagmati",
        city: "Lalitpur",
        area: "Jhamsikhel",
        pincode: "44700",
      },
      seller: seller._id,
      sellerContact: {
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
      },
      attributes: {
        Bedrooms: "2 BHK",
        Furnished: "Fully Furnished",
        Parking: "Available",
      },
      status: "approved",
      isFeatured: false,
      approvedAt: new Date(),
    },
  ];

  const created = await Advertisement.insertMany(sampleAds);
  console.log(`✓ Seeded ${created.length} sample advertisements (2 pending, 4 approved)!`);
  process.exit(0);
};

seed();
