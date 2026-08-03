export enum TrackingStage {
  ORDER_CONFIRMED = 'order_confirmed',
  ORIGIN = 'origin',
  PORT_DEPARTURE = 'port_departure',
  IN_TRANSIT = 'in_transit',
  PORT_ARRIVAL = 'port_arrival',
  CUSTOMS = 'customs_clearance',
  WAREHOUSE = 'warehouse',
  READY_DELIVERY = 'ready_delivery',
  DELIVERED = 'delivered',
}

export interface TrackingStageMeta {
  id: TrackingStage;
  label: string;
  icon: string;
  description: string;
  estimatedDays: number;
}

export const TRACKING_STAGES: TrackingStageMeta[] = [
  {
    id: TrackingStage.ORDER_CONFIRMED,
    label: 'Order Confirmed',
    icon: '🏷️',
    description: 'Vehicle purchased, tracking starts',
    estimatedDays: 0,
  },
  {
    id: TrackingStage.ORIGIN,
    label: 'Origin',
    icon: '🌍',
    description: 'At source location',
    estimatedDays: 0,
  },
  {
    id: TrackingStage.PORT_DEPARTURE,
    label: 'Port Departure',
    icon: '🚢',
    description: 'Loaded, departed from origin port',
    estimatedDays: 0,
  },
  {
    id: TrackingStage.IN_TRANSIT,
    label: 'In Transit',
    icon: '📦',
    description: 'On ship, en route',
    estimatedDays: 20,
  },
  {
    id: TrackingStage.PORT_ARRIVAL,
    label: 'Port Arrival',
    icon: '🏝️',
    description: 'Arrived at destination port',
    estimatedDays: 0,
  },
  {
    id: TrackingStage.CUSTOMS,
    label: 'Customs Clearance',
    icon: '🛂',
    description: 'In customs clearance process',
    estimatedDays: 5,
  },
  {
    id: TrackingStage.WAREHOUSE,
    label: 'Warehouse',
    icon: '🏪',
    description: 'In warehouse, being prepared',
    estimatedDays: 2,
  },
  {
    id: TrackingStage.READY_DELIVERY,
    label: 'Ready for Delivery',
    icon: '✅',
    description: 'Ready to hand over to buyer',
    estimatedDays: 0,
  },
  {
    id: TrackingStage.DELIVERED,
    label: 'Delivered',
    icon: '🎯',
    description: 'Vehicle delivered to buyer',
    estimatedDays: 0,
  },
];

export function getStageMeta(stage: string): TrackingStageMeta | undefined {
  return TRACKING_STAGES.find((s) => s.id === stage);
}

export function getStageLabel(stage: string): string {
  return getStageMeta(stage)?.label ?? stage;
}

export function getStageIcon(stage: string): string {
  return getStageMeta(stage)?.icon ?? '📍';
}

export function getEstimatedDaysForStage(stage: string): number {
  return getStageMeta(stage)?.estimatedDays ?? 0;
}

export function getStageIndex(stage: string): number {
  return TRACKING_STAGES.findIndex((s) => s.id === stage);
}
