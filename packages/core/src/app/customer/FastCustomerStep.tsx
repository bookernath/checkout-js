import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { Button, ButtonVariant } from '../ui/button';
import { TextInput } from '../ui/form';

import { preloadCustomerState, type CustomerPreloadState } from './CustomerPreloader';

export interface FastCustomerStepProps {
    onContinueAsGuest?: (email: string) => void;
    onProceedToNextStep?: () => void;
    onShowFullCustomerForm?: () => void;
    isFloatingLabelEnabled?: boolean;
}

interface LoggedInCustomerDisplayProps {
    customerData: NonNullable<CustomerPreloadState['customerData']>;
    onProceedToNextStep?: () => void;
}

/**
 * Fast-rendering display for logged-in customers
 * Shows customer info immediately and provides quick proceed button
 */
const LoggedInCustomerDisplay: React.FC<LoggedInCustomerDisplayProps> = ({
    customerData,
    onProceedToNextStep
}) => {
    const handleProceed = useCallback(() => {
        onProceedToNextStep?.();
    }, [onProceedToNextStep]);

    return (
        <div className="fast-customer-logged-in" data-test="fast-customer-logged-in">
            <div className="customer-info-display">
                <div className="customer-email">
                    <strong>{customerData.email}</strong>
                </div>
                <div className="customer-name text-muted">
                    {customerData.name}
                </div>
            </div>
            <Button
                className="continue-button"
                onClick={handleProceed}
                variant={ButtonVariant.Primary}
                data-test="customer-continue-button"
            >
                <TranslatedString id="customer.continue_as_customer_button" />
            </Button>
        </div>
    );
};

interface FastGuestEmailProps {
    onContinueAsGuest?: (email: string) => void;
    onShowFullCustomerForm?: () => void;
    isFloatingLabelEnabled?: boolean;
}

/**
 * Fast-rendering email field for guest users
 * Focuses immediately and provides quick continue functionality
 */
const FastGuestEmail: React.FC<FastGuestEmailProps> = ({
    onContinueAsGuest,
    onShowFullCustomerForm,
    isFloatingLabelEnabled
}) => {
    const [email, setEmail] = useState('');
    const [isValid, setIsValid] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus email field for immediate interaction
    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, []);

    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setIsValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
    }, []);

    const handleContinue = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (isValid && email) {
            onContinueAsGuest?.(email);
        }
    }, [email, isValid, onContinueAsGuest]);

    const handleShowFullForm = useCallback(() => {
        onShowFullCustomerForm?.();
    }, [onShowFullCustomerForm]);

    return (
        <div className="fast-guest-email" data-test="fast-guest-email">
            <form onSubmit={handleContinue} className="fast-email-form">
                <div className="email-field-wrapper">
                    <TextInput
                        ref={emailInputRef}
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="Enter your email address"
                        autoComplete="email"
                        isFloatingLabelEnabled={isFloatingLabelEnabled}
                        data-test="fast-email-input"
                        className="fast-email-input"
                    />
                </div>
                <div className="action-buttons">
                    <Button
                        type="submit"
                        disabled={!isValid}
                        variant={ButtonVariant.Primary}
                        data-test="fast-continue-guest-button"
                    >
                        <TranslatedString id="customer.continue_as_guest_action" />
                    </Button>
                    <Button
                        type="button"
                        onClick={handleShowFullForm}
                        variant={ButtonVariant.Secondary}
                        data-test="show-full-customer-form-button"
                    >
                        <TranslatedString id="customer.sign_in_action" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

/**
 * Fast-rendering customer step component that provides immediate interaction
 * Bypasses heavy initialization by using preloaded window.customer data
 */
export const FastCustomerStep: React.FC<FastCustomerStepProps> = ({
    onContinueAsGuest,
    onProceedToNextStep,
    onShowFullCustomerForm,
    isFloatingLabelEnabled
}) => {
    // Memoize preload state to avoid recalculation
    const preloadState = useMemo(() => preloadCustomerState(), []);

    // Render logged-in customer display immediately
    if (preloadState.isLoggedIn && preloadState.customerData) {
        return (
            <LoggedInCustomerDisplay
                customerData={preloadState.customerData}
                onProceedToNextStep={onProceedToNextStep}
            />
        );
    }

    // Render fast guest email field for immediate interaction
    return (
        <FastGuestEmail
            onContinueAsGuest={onContinueAsGuest}
            onShowFullCustomerForm={onShowFullCustomerForm}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
        />
    );
};

export default FastCustomerStep;