/**
 * Core Urban Pulse Data Structure and Type Definitions
 *
 * This file serves as the strict, data-driven "State" contract and "Source of Truth"
 * for the Urban Digital Twin, sensory nodes, analytics, and neighborhood entities.
 */

/**
 * The types of functional location nodes represented within the digital twin.
 */
export type LocationNodeType =
  | "sensor" // Physical IoT sensor measuring real-time metrics
  | "artisan" // Traditional craftsmanship shop / cultural point
  | "park" // Public parks, flora zones, and green spaces
  | "incident" // Active community report, environmental issue, or restoration zone
  | "community_hub"; // Community centers, workshops, and meeting spots

/**
 * Health and operational statuses for sensory and location nodes.
 */
export type NodeStatus = "active" | "maintenance" | "offline" | "resolved";

/**
 * Levels of crowd density tracked in the digital twin.
 */
export type CrowdDensityLevel = "low" | "moderate" | "high";

/**
 * Unified urban metrics capture block, powering real-time analytics.
 */
export interface UrbanMetrics {
  aqi: number; // Air Quality Index (0-500)
  noiseLevelDb: number; // Ambient sound level in decibels (dB)
  crowdDensity: CrowdDensityLevel; // Visual/sensor-based density level
  temperature: number; // Celsius
  humidity: number; // Percentage (0-100)
  updatedAt: string; // ISO-8601 Timestamp of last reading
}

/**
 * A Location Node representing a physical or digital asset in the Urban Twin map.
 */
export interface LocationNode {
  id: string; // Unique node identifier (e.g., "node_fahui_park_north")
  name: string; // Human-readable display name
  description: string; // Detailed context or historical value
  type: LocationNodeType; // Node categorization
  status: NodeStatus; // Node lifecycle state
  latitude: number; // Map coordinate
  longitude: number; // Map coordinate
  tags: string[]; // Searchable tags (e.g., ["upcycling", "craft", "noise-alert"])
  metrics?: UrbanMetrics; // Real-time environmental metrics (if sensor or active area)
  artisanId?: string; // Reference to Artisan dataset (if type is "artisan")
  workshopId?: number; // Reference to Workshop dataset (if type is "community_hub")
  creatorId?: string; // Reference to the user who reported (if type is "incident")
}

/**
 * Historical Data Point used for charting, comparisons, and Digital Twin trends.
 */
export interface UrbanAnalyticsPoint {
  timestamp: string; // ISO-8601 Timestamp
  nodeId: string; // Linked location node ID
  metric: keyof Omit<UrbanMetrics, "updatedAt" | "crowdDensity">; // Numeric metric key
  value: number; // Numeric value recorded
}

/**
 * Aggregate neighborhood-wide analytics for reporting and dashboards.
 */
export interface NeighborhoodPulseSummary {
  district: string; // District name (e.g., "Fa Hui, Mong Kok")
  averageAqi: number; // Average AQI across all active nodes
  averageNoiseDb: number; // Average noise level across all active nodes
  totalSensorsCount: number; // Total IoT sensory nodes connected
  activeIncidentsCount: number; // Reports currently outstanding
  restoredHotspotsCount: number; // Citizen-restored locations
  lastUpdated: string; // ISO-8601 Timestamp of aggregation
}

/**
 * Represents a single transaction inside the user's community wallet.
 */
export interface WalletTransaction {
  id: string; // Unique transaction reference ID
  amount: number; // Positive for earn, negative for spend
  type: "earn" | "spend"; // Transaction type
  description: string; // Human-readable transaction memo
  timestamp: string | unknown; // Timestamp or Firestore FieldValue
}
