export interface PreloadedCustomer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    store_credit?: {
        formatted: string;
        value: number;
        currency: string;
    };
    shipping_address?: {
        id: string;
        first_name: string;
        last_name: string;
        company?: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone?: string;
        state_id: string;
        country_id: string;
        destination: string;
        last_used: string;
        form_session_id: string;
    };
    recently_viewed_products?: any;
    wishlists?: any;
    addresses?: any;
    returns?: any;
    payment_methods?: any;
    edit_stored_instrument?: any;
}

export interface CustomerPreloadState {
    isLoggedIn: boolean;
    email?: string;
    customerData?: PreloadedCustomer;
    shouldSkipCustomerStep: boolean;
    hasShippingAddress: boolean;
    canProceedDirectlyToShipping: boolean;
}

declare global {
    interface Window {
        customer?: PreloadedCustomer | null;
    }
}

/**
 * Preloads customer state from window.customer for immediate hydration
 * This enables faster rendering by avoiding SDK initialization delays
 */
export function preloadCustomerState(): CustomerPreloadState {
    const customerData = window.customer;

    if (customerData) {
        const hasShippingAddress = !!(customerData.shipping_address?.address1);

        return {
            isLoggedIn: true,
            email: customerData.email,
            customerData,
            shouldSkipCustomerStep: true,
            hasShippingAddress,
            canProceedDirectlyToShipping: hasShippingAddress
        };
    }

    return {
        isLoggedIn: false,
        shouldSkipCustomerStep: false,
        hasShippingAddress: false,
        canProceedDirectlyToShipping: false
    };
}

/**
 * Determines the optimal step to start checkout based on preloaded customer state
 */
export function getOptimalStartingStep(preloadState: CustomerPreloadState): 'customer' | 'shipping' | 'billing' | 'payment' {
    if (!preloadState.isLoggedIn) {
        return 'customer';
    }

    if (preloadState.canProceedDirectlyToShipping) {
        return 'shipping';
    }

    // Logged in but no shipping address - still need shipping step
    return 'shipping';
}

/**
 * Checks if the customer step can be completely bypassed
 */
export function canBypassCustomerStep(preloadState: CustomerPreloadState): boolean {
    return preloadState.isLoggedIn && !!preloadState.email;
}

/**
 * Gets the next step that should be preloaded based on current state
 */
export function getNextStepToPreload(preloadState: CustomerPreloadState): string[] {
    const steps: string[] = [];

    if (preloadState.shouldSkipCustomerStep) {
        steps.push('shipping');

        if (preloadState.hasShippingAddress) {
            steps.push('billing', 'payment');
        }
    } else {
        // For guest users, preload customer components
        steps.push('customer-guest');
    }

    return steps;
}