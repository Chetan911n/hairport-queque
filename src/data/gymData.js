export const gymDetails = {
  name: "M Square Fitness & Wellness Club",
  brandTitle: "MSquare Fitness & Wellness Club®️",
  tagline: "Premier Gym & Wellness Centre in Devlali Camp",
  managerName: "Akshay Shelke",
  googleRating: 4.4,
  reviewCount: 52,
  phone: "+91 77750 77653",
  alternatePhones: ["+91 91725 30292", "+91 70282 14514"],
  whatsapp: "917775077653",
  email: "square828@gmail.com",
  address: "Ground Floor, Mande's Mango Tree, Naka No.06, Mahalaxmi Road, Lam Road, Deolali Camp, Nashik, Maharashtra 422501",
  landmark: "Near Mande's Mango Tree & Mahalaxmi Mandir Road Naka No. 6",
  hours: "Open Daily 6:00 AM — 10:00 PM",
  peakHours: "5:00 PM – 10:00 PM",
  instagram: "https://www.instagram.com/msquarefitnessclub/",
  facebook: "https://www.facebook.com/100091178355488"
};

export const trustBadges = [
  {
    icon: "Star",
    val: "4.4",
    title: "Google Rating",
    sub: "★★★★★ (52 Verified Reviews)"
  },
  {
    icon: "Flame",
    val: "Steam Bath",
    title: "Muscle Recovery",
    sub: "Weekend & Unlimited Options"
  },
  {
    icon: "Dumbbell",
    val: "Crossfit",
    title: "& Heavy Strength",
    sub: "Modern Machine Suite"
  },
  {
    icon: "MapPin",
    val: "Devlali",
    title: "Camp, Nashik",
    sub: "Mahalaxmi Road, Naka No. 6"
  }
];

export const megaOffers = [
  {
    title: "12 Months Membership",
    price: "₹12,000/- Only",
    badge: "MEGA SAVER OFFER",
    note: "Installment Option Available"
  },
  {
    title: "16 Months Membership",
    price: "₹15,000/- Only",
    badge: "MAX VALUE OFFER",
    note: "4 Extra Months Free + Installment"
  }
];

export const membershipPlans = [
  {
    id: "1-month",
    title: "1 Month Starter",
    duration: "1 Month",
    price: "₹3,000",
    period: "/ 1 Month",
    popular: false,
    badge: "Basic Plan",
    features: [
      "Cardio Suite Access",
      "Heavy Strength & Weight Training",
      "Cross-Fit Functional Zone",
      "General Gym Supervision"
    ],
    cta: "Enquire 1 Month Plan"
  },
  {
    id: "3-months",
    title: "3 Months Transformation",
    duration: "3 Months",
    price: "₹6,000",
    period: "/ 3 Months",
    popular: false,
    badge: "Popular Plan",
    features: [
      "Cardio + Strength + Cross-Fit Access",
      "Diet Orientation & Nutrition Guidance",
      "Progress Tracking & Assessment",
      "Locker & Shower Facility"
    ],
    cta: "Enquire 3 Month Plan"
  },
  {
    id: "6-months",
    title: "Crown Club Membership",
    duration: "6 Months",
    price: "₹10,000",
    period: "/ 6 Months",
    popular: true,
    badge: "CROWN CLUB",
    features: [
      "Cardio + Strength + Cross-Fit Access",
      "Diet Orientation & Nutrition Plan",
      "Steam-Bath Recovery (Weekends Only)",
      "Temporary Locker Access",
      "Installment Facility Available"
    ],
    cta: "Enquire Crown Club — ₹10,000"
  },
  {
    id: "12-months",
    title: "Elite Club Membership",
    duration: "12 Months",
    price: "₹15,000",
    period: "/ 12 Months",
    popular: true,
    badge: "ELITE VIP CLUB",
    features: [
      "Unlimited Cardio, Strength & Cross-Fit",
      "Diet Orientation & Custom Meal Plan",
      "Unlimited Steam-Bath Access",
      "Zumba Sessions (Twice a Week)",
      "FREE 3 Personal Training Sessions",
      "Temporary Lockers + Installment Facility"
    ],
    cta: "Enquire Elite VIP — ₹15,000"
  }
];

export const officialServices = [
  {
    id: "cardio",
    title: "Cardio Suite",
    desc: "Motorized treadmills, elliptical cross-trainers, and spinning bikes for maximum cardiovascular endurance and calorie burn.",
    image: "/pexels_photos/pexels_cardio_1.jpg",
    fallback: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80",
    tag: "Stamina & Fat Loss"
  },
  {
    id: "crossfit",
    title: "Crossfit & Functional Training",
    desc: "High-intensity functional movement rigs, battle ropes, kettlebells, and agility zones to build athletic speed and core power.",
    image: "/pexels_photos/pexels_bodybuilding_1.jpg",
    fallback: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    tag: "Athletic Power"
  },
  {
    id: "weight-training",
    title: "Weight Training & Free Weights",
    desc: "Heavy plate-loaded machines, Olympic barbells, Smith machines, squat racks, and full dumbbell sets (2kg to 40kg+).",
    image: "/pexels_photos/pexels_strength_1.jpg",
    fallback: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    tag: "Muscle Building"
  },
  {
    id: "personal-training",
    title: "Personal Training (1-on-1)",
    desc: "Dedicated certified personal trainers providing customized workout programs, 1-on-1 form supervision, and maximum results.",
    image: "/pexels_photos/pexels_coaching_1.jpg",
    fallback: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    tag: "Dedicated Coach"
  },
  {
    id: "diet-orientation",
    title: "Diet Orientation & Nutrition",
    desc: "Personalized nutrition consultation and diet orientation to complement your workout regime for optimal muscle growth and weight loss.",
    image: "/pexels_photos/pexels_coaching_3.jpg",
    fallback: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    tag: "Custom Nutrition"
  },
  {
    id: "steam-bath",
    title: "Steam Bath Recovery",
    desc: "Hot steam bath sessions designed to soothe sore muscles, improve circulation, relieve tension, and accelerate post-workout recovery.",
    image: "/pexels_photos/pexels_sauna_1.jpg",
    fallback: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    tag: "Muscle Relaxation"
  }
];

export const exerciseGuides = [
  {
    title: "Barbell Back Squat",
    category: "Lower Body",
    target: "Quadriceps & Glutes",
    tip: "Keep chest proud, break at hips, and drive up through heels with core engaged.",
    image: "/pexels_photos/pexels_strength_1.jpg",
    fallback: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Heavy Cable Lat Pulldown",
    category: "Upper Body",
    target: "Lats & Upper Back",
    tip: "Drive elbows down to side ribs, squeeze shoulder blades, and control the negative.",
    image: "/pexels_photos/pexels_bodybuilding_1.jpg",
    fallback: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Dumbbell Incline Bench Press",
    category: "Chest & Shoulders",
    target: "Upper Pectorals & Triceps",
    tip: "Set incline to 30 degrees, lower dumbbells steadily to chest level, and press upward.",
    image: "/pexels_photos/pexels_strength_3.jpg",
    fallback: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "High-Intensity Treadmill Sprints",
    category: "Cardio & Stamina",
    target: "Cardiovascular Endurance",
    tip: "Maintain upright posture, land midfoot, and alternate 30s sprint with 60s recovery walk.",
    image: "/pexels_photos/pexels_cardio_1.jpg",
    fallback: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80"
  }
];

export const reviewsList = [
  {
    author: "Rahul V.",
    rating: 5,
    title: "Quality & Variety of Machines",
    comment: "Quality and variety of machines (cardio, weight, free weights). Best workout atmosphere in Devlali!"
  },
  {
    author: "Pooja S.",
    rating: 5,
    title: "Family Friendly & Steam Bath",
    comment: "Good atmosphere, family friendly gym and relaxing steam bath after heavy workouts."
  },
  {
    author: "Amit K.",
    rating: 5,
    title: "Great Trainers & Environment",
    comment: "Awesome training facility in Devlali Camp. Outstanding personal trainers, Akshay Shelke sir, and supportive environment!"
  }
];

export const galleryPhotos = [
  { url: "/photos/official_gmaps_photo_1.jpg", fallback: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", category: "Strength" },
  { url: "/pexels_photos/pexels_strength_1.jpg", fallback: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80", category: "Strength" },
  { url: "/pexels_photos/pexels_bodybuilding_1.jpg", fallback: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80", category: "Strength" },
  { url: "/pexels_photos/pexels_cardio_1.jpg", fallback: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80", category: "Cardio" },
  { url: "/pexels_photos/pexels_coaching_1.jpg", fallback: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80", category: "Coaching" },
  { url: "/pexels_photos/pexels_zumba_1.jpg", fallback: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80", category: "Zumba" },
  { url: "/pexels_photos/pexels_sauna_1.jpg", fallback: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80", category: "Steam Bath" },
  { url: "/pexels_photos/pexels_strength_3.jpg", fallback: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80", category: "Strength" },
  { url: "/pexels_photos/pexels_cardio_3.jpg", fallback: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80", category: "Cardio" },
  { url: "/pexels_photos/pexels_coaching_3.jpg", fallback: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80", category: "Coaching" }
];
