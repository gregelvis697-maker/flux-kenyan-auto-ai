/**
 * Contact URL generation utilities.
 * Builds native WhatsApp (wa.me), phone (tel:) and email (mailto:) links.
 * No third-party APIs, no keys.
 */

export interface DealerContact {
  whatsappNumber?: string | null;
  phoneNumber?: string | null;
  emailPublic?: string | null;
  showWhatsapp?: boolean | null;
  showPhone?: boolean | null;
  showEmail?: boolean | null;
}

export interface VehicleInfo {
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  price?: number | null;
}

export type ContactMethod = 'whatsapp' | 'phone' | 'email';

function vehicleName(vehicle?: VehicleInfo | null): string {
  if (!vehicle) return '';
  return [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
}

export class ContactUtils {
  /** WhatsApp click-to-chat link with optional pre-filled message. */
  static generateWhatsAppLink(phoneNumber?: string | null, message?: string): string {
    if (!phoneNumber) return '';
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (!cleanNumber) return '';
    const baseUrl = `https://wa.me/${cleanNumber}`;
    return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
  }

  /** Click-to-call link. */
  static generatePhoneLink(phoneNumber?: string | null): string {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    return cleaned ? `tel:${cleaned}` : '';
  }

  /** Mailto link with pre-filled subject and body. */
  static generateEmailLink(email?: string | null, subject?: string, body?: string): string {
    if (!email) return '';
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    const queryString = params.toString();
    return `mailto:${email}${queryString ? `?${queryString}` : ''}`;
  }

  /** Pre-filled WhatsApp message including the vehicle, when known. */
  static generateVehicleInquiryMessage(vehicle?: VehicleInfo | null): string {
    const name = vehicleName(vehicle);
    if (!name) return "Hi, I'm interested in one of your vehicles on Flux. Is it still available?";
    return `Hi, I'm interested in your ${name} listed on Flux. Is it still available? I'd like to know more details and arrange a viewing.`;
  }

  static generateEmailSubject(vehicle?: VehicleInfo | null): string {
    const name = vehicleName(vehicle);
    return name ? `Inquiry: ${name}` : 'Vehicle Inquiry';
  }

  static generateEmailBody(vehicle?: VehicleInfo | null): string {
    const name = vehicleName(vehicle);
    if (!name) {
      return `Hello,

I am interested in learning more about one of your vehicles listed on Flux. Could you please share additional details and confirm availability?

Thank you,
Interested Buyer`;
    }
    return `Hello,

I am interested in the ${name} listed on Flux. Could you please provide more details about this vehicle and confirm availability?

I am ready to arrange a viewing at your earliest convenience.

Thank you,
Interested Buyer`;
  }

  /** Loose international phone validation: 9–15 digits. */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return cleanNumber.length >= 9 && cleanNumber.length <= 15;
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Display formatting for Kenyan and generic numbers. */
  static formatPhoneNumber(phoneNumber?: string | null): string {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length === 12 && cleaned.startsWith('254')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phoneNumber;
  }

  /** Which contact methods are enabled and populated. */
  static getActiveContactMethods(contact: DealerContact | null | undefined): ContactMethod[] {
    if (!contact) return [];
    const active: ContactMethod[] = [];
    if (contact.showWhatsapp !== false && contact.whatsappNumber) active.push('whatsapp');
    if (contact.showPhone !== false && contact.phoneNumber) active.push('phone');
    if (contact.showEmail !== false && contact.emailPublic) active.push('email');
    return active;
  }
}
