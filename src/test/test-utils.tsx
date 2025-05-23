import { ReactElement, ReactNode } from "react";

import { RenderOptions, render } from "@testing-library/react";

import { ThemeProvider } from "@/components/theme/theme-context";
import { AppSettingsProvider } from "@/features/app-state/app-settings-provider";
import { ResourcesProvider } from "@/features/browser/resources";
import { ProjectSettingsProvider } from "@/features/modals/features/project-settings/project-settings-provider";
import { UserSettingsProvider } from "@/features/modals/features/user-settings/user-settings-provider";
import { ModalProvider } from "@/features/modals/services/modal-provider";
import { PlayerProvider } from "@/features/video-player/components/player-provider";
import { I18nProvider } from "@/i18n/i18n-provider";

// Провайдер для всех тестов
export const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppSettingsProvider>
          <ProjectSettingsProvider>
            <UserSettingsProvider>
              <PlayerProvider>
                <ModalProvider>
                  <ResourcesProvider>{children}</ResourcesProvider>
                </ModalProvider>
              </PlayerProvider>
            </UserSettingsProvider>
          </ProjectSettingsProvider>
        </AppSettingsProvider>
      </I18nProvider>
    </ThemeProvider>
  );
};

// Кастомная функция рендеринга
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllProviders, ...options });

// Реэкспортируем только то, что нам нужно
export { screen, fireEvent, waitFor, within } from "@testing-library/react";

// Переопределение функции render
export { customRender as render };
