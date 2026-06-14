declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    interface PageData {
      businessInfo?: import('$lib/api').BusinessInfo | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
