import { toDbProperty, type FeedProperty } from "../expert-agent-feed.ts";
import {
  deriveSearchFeatures,
  normalizePropertyType,
  normalizeTenure,
  type PropertySourceAdapter,
} from "./property-source.ts";

export const expertAgentAdapter: PropertySourceAdapter<FeedProperty> = {
  sourceSystem: "expert_agent",
  map(record, { syncedAt }) {
    const base = toDbProperty(record);
    return {
      ...base,
      source_system: "expert_agent",
      source_id: record.reference,
      source_updated_at: undefined,
      last_synced_at: syncedAt,
      is_active: true,
      search_property_type: normalizePropertyType(base.property_type),
      search_tenure: normalizeTenure(base.tenure),
      search_features: deriveSearchFeatures(base.features, base.virtual_tour_url),
    };
  },
};
