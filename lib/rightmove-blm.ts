// Rightmove BLM Feed Generator
// Generates BLM (Bulk Load Mass) XML files for Rightmove property portal
// TODO: Add credentials to .env.local:
//   RIGHTMOVE_NETWORK_ID=your_network_id
//   RIGHTMOVE_BRANCH_ID=your_branch_id
//   RIGHTMOVE_FTP_HOST=your_ftp_host
//   RIGHTMOVE_FTP_USER=your_ftp_user
//   RIGHTMOVE_FTP_PASSWORD=your_ftp_password

import { supabaseAdmin, type DbProperty } from "./supabase";

const NETWORK_ID = process.env.RIGHTMOVE_NETWORK_ID ?? "";
const BRANCH_ID = process.env.RIGHTMOVE_BRANCH_ID ?? "";
const FTP_HOST = process.env.RIGHTMOVE_FTP_HOST ?? "";
const FTP_USER = process.env.RIGHTMOVE_FTP_USER ?? "";
const FTP_PASSWORD = process.env.RIGHTMOVE_FTP_PASSWORD ?? "";

function isConfigured(): boolean {
  return Boolean(NETWORK_ID && BRANCH_ID && FTP_HOST);
}

function mapPropertyType(type: string): number {
  const typeMap: Record<string, number> = {
    "Detached": 1,
    "Semi-Detached": 2,
    "Terraced": 3,
    "Flat": 4,
    "Apartment": 4,
    "Bungalow": 5,
    "Maisonette": 6,
    "Land": 12,
    "Commercial": 28,
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return 0; // Not specified
}

function mapStatus(status: DbProperty["status"]): number {
  const statusMap: Record<string, number> = {
    for_sale: 1,     // Available
    under_offer: 2,  // Under Offer
    sold: 4,         // SSTC
    withdrawn: 0,
  };
  return statusMap[status] ?? 1;
}

export function generateBLM(properties: DbProperty[]): string {
  const header = [
    "#HEADER#",
    `Version : 3`,
    `EOF : '^'`,
    `EOR : '~'`,
    ``,
    `#DEFINITION#`,
    `AGENT_REF^ADDRESS_1^ADDRESS_2^ADDRESS_3^ADDRESS_4^POSTCODE1^POSTCODE2^FEATURE1^FEATURE2^FEATURE3^FEATURE4^FEATURE5^SUMMARY^DESCRIPTION^BRANCH_ID^STATUS_ID^BEDROOMS^BATHROOMS^PRICE^PRICE_QUALIFIER^PROP_SUB_ID^TRANS_TYPE_ID^MEDIA_IMAGE_00^MEDIA_IMAGE_01^MEDIA_IMAGE_02^MEDIA_IMAGE_03^MEDIA_IMAGE_04~`,
    ``,
    `#DATA#`,
  ].join("\n");

  const records = properties
    .filter((p) => p.status !== "withdrawn")
    .map((p) => {
      const addressParts = p.address.split(",").map((s) => s.trim());
      const [postcode1, postcode2] = p.postcode.split(" ");
      const features = p.features.slice(0, 5);

      return [
        p.expert_agent_id || p.id,
        addressParts[0] || "",
        addressParts[1] || "",
        addressParts[2] || "",
        addressParts[3] || "",
        postcode1 || "",
        postcode2 || "",
        features[0] || "",
        features[1] || "",
        features[2] || "",
        features[3] || "",
        features[4] || "",
        p.description.substring(0, 200),
        p.description,
        BRANCH_ID,
        mapStatus(p.status),
        p.bedrooms,
        p.bathrooms,
        p.price,
        p.price_qualifier || "",
        mapPropertyType(p.property_type),
        1, // Sales
        p.images[0] || "",
        p.images[1] || "",
        p.images[2] || "",
        p.images[3] || "",
        p.images[4] || "",
      ].join("^") + "~";
    });

  return header + "\n" + records.join("\n") + "\n#END#";
}

export async function generateAndUploadFeed(): Promise<{
  success: boolean;
  propertyCount: number;
  error?: string;
}> {
  if (!isConfigured()) {
    return { success: false, propertyCount: 0, error: "Rightmove not configured" };
  }

  if (!supabaseAdmin) {
    return { success: false, propertyCount: 0, error: "Supabase not configured" };
  }

  // Fetch all active properties
  const { data: properties, error } = await supabaseAdmin
    .from("properties")
    .select("*")
    .in("status", ["for_sale", "under_offer"]);

  if (error || !properties) {
    return { success: false, propertyCount: 0, error: error?.message ?? "No properties found" };
  }

  // Generate BLM
  const blmContent = generateBLM(properties);

  // TODO: Upload via FTP when credentials are available
  // const ftp = new FTPClient();
  // await ftp.connect({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD });
  // await ftp.upload(Buffer.from(blmContent), `${NETWORK_ID}_${BRANCH_ID}.blm`);
  // await ftp.close();

  console.log(`BLM feed generated: ${properties.length} properties`);

  return { success: true, propertyCount: properties.length };
}
