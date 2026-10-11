export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  description: string;
  freeShippingMinimum: number;
  standardShippingFee: number;
  expressShippingFee: number;
  overnightShippingFee: number;
  whatsappNumber: string;
  whatsappMessage: string;
  happyCustomersImages: string[];
  serviceAvailableImages: string[];
}

const pexelsPhoto = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Universal Cycles",
  contactEmail: "support@universalcycles.in",
  description: "Premium bicycles, accessories, and gear for your next ride.",
  freeShippingMinimum: 10000,
  standardShippingFee: 499,
  expressShippingFee: 999,
  overnightShippingFee: 1999,
  whatsappNumber: "919876543210",
  whatsappMessage: "Hello Universal Cycles! I'm interested in placing an order.",
  happyCustomersImages: [
    pexelsPhoto(9029446), pexelsPhoto(10202931), pexelsPhoto(8350903), pexelsPhoto(8350904),
    pexelsPhoto(5225456), pexelsPhoto(37371612), pexelsPhoto(10203436), pexelsPhoto(10203441),
    pexelsPhoto(15009966), pexelsPhoto(36972866), pexelsPhoto(10220126), pexelsPhoto(8350899),
    pexelsPhoto(22863958), pexelsPhoto(7242951), pexelsPhoto(7243314)
  ],
  serviceAvailableImages: [
    pexelsPhoto(5808010), pexelsPhoto(6334127), pexelsPhoto(5808019), pexelsPhoto(28100861),
    pexelsPhoto(5808015), pexelsPhoto(19895873), pexelsPhoto(37129441), pexelsPhoto(8926739),
    pexelsPhoto(34197976), pexelsPhoto(10263877), pexelsPhoto(31628823), pexelsPhoto(14157266),
    pexelsPhoto(545000), pexelsPhoto(17593893), pexelsPhoto(5807907)
  ],
};

export const STORE_SETTINGS_STORAGE_KEY = "uc_store_settings";
