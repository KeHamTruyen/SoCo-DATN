/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import AppRouter from "./app/router";
import { MessagingProvider } from "./features/messaging/context/MessagingContext";

export default function App() {
    return (
        <MessagingProvider>
            <AppRouter />
        </MessagingProvider>
    );
}
