import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  provideRouter,
  withInMemoryScrolling,
  withComponentInputBinding,
} from "@angular/router";
import { provideOptimus } from "@openng/optimus-ui/config";
import { MessageService, ConfirmationService } from "@openng/optimus-ui/api";
import { definePreset } from "@openng/optimus-ui-themes";
import Aura from "@openng/optimus-ui-themes/aura";
import { routes } from "./app.routes";

const AdminPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{zinc.50}",
      100: "{zinc.100}",
      200: "{zinc.200}",
      300: "{zinc.300}",
      400: "{zinc.400}",
      500: "{zinc.500}",
      600: "{zinc.600}",
      700: "{zinc.700}",
      800: "{zinc.800}",
      900: "{zinc.900}",
      950: "{zinc.950}",
    },
    colorScheme: {
      light: {
        primary: {
          color: "{zinc.900}",
          contrastColor: "#ffffff",
          hoverColor: "{zinc.800}",
          activeColor: "{zinc.700}",
        },
        highlight: {
          background: "{zinc.100}",
          focusBackground: "{zinc.200}",
          color: "{zinc.950}",
          focusColor: "{zinc.950}",
        },
      },
      dark: {
        primary: {
          color: "{zinc.50}",
          contrastColor: "{zinc.950}",
          hoverColor: "{zinc.200}",
          activeColor: "{zinc.300}",
        },
        highlight: {
          background: "{zinc.800}",
          focusBackground: "{zinc.700}",
          color: "{zinc.50}",
          focusColor: "{zinc.50}",
        },
      },
    },
    formField: { borderRadius: "7px", paddingY: "0.6rem" },
  },
  components: {
    message: {
      colorScheme: {
        light: { success: { color: "{green.700}" } },
        dark: { success: { color: "{green.400}" } },
      },
    },
    togglebutton: {
      colorScheme: {
        light: { root: { color: "{zinc.600}", hoverColor: "{zinc.800}" } },
        dark: { root: { color: "{zinc.300}", hoverColor: "{zinc.100}" } },
      },
    },
    button: { root: { borderRadius: "7px", paddingY: "0.55rem" } },
    dialog: { root: { borderRadius: "12px" } },
    card: { root: { shadow: "none", borderRadius: "12px" } },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
    ),
    provideOptimus({
      pt: {
        // Font icons are decorative; screen readers should announce the button label.
        button: {
          icon: { "aria-hidden": "true" },
          loadingIcon: { "aria-hidden": "true" },
        },
      },
      theme: {
        preset: AdminPreset,
        options: {
          darkModeSelector: ".dark",
          cssLayer: { name: "optimus", order: "reset, optimus, app" },
        },
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
