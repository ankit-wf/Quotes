import { Toast } from '@shopify/polaris';
import React, { useState, useCallback } from 'react';

const useToast = (message) => {
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content={message} onDismiss={toggleActive} />
    ) : null;

    const errorToastMarkup = active ? (
        <Toast content={message} error onDismiss={toggleActive} />
    ) : null;

    return {
        setActive: setActive,
        active: active,
        toggleActive: toggleActive,
        toastMarkup: toastMarkup,
        errorToastMarkup: errorToastMarkup
    }
}

export default useToast;