"use server"

import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

export const autocomplete = async (query: string) => {
  // Don't make API calls for empty or very short queries
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const response = await client.placeAutocomplete({
      params: {
        input: query.trim(),
        key: process.env.GOOGLE_API_KEY!,
      },
    });


    console.log(response.data.predictions);
    
    return response.data.predictions;
  } catch (error) {
    console.error("Google Places API error:", error);
    return [];
  }
};
