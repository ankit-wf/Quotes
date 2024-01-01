import { useLocation, useNavigate, BrowserRouter } from 'react-router-dom';
import { Provider, NavigationMenu, Loading } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";
import { useEffect } from 'react';

export default function App() {
  const config = {
    // The client ID provided for your application in the Partner Dashboard.
    apiKey: process.env.SHOPIFY_API_KEY,
    // The host of the specific shop that's embedding your app. This value is provided by Shopify as a URL query parameter that's appended to your application URL when your app is loaded inside the Shopify admin.
    host: new URLSearchParams(location.search).get("host"),
    forceRedirect: true
  };
  const loading = true;

  const loadingComponent = loading ? <Loading /> : null;
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  //FIND APP NAME
  // const navigate = useNavigate();
  // const location = useLocation();
  // const history = useMemo(
  //   () => ({ replace: (path) => navigate(path, { replace: true }) }),
  //   [navigate],
  // );

  // const router = useMemo(
  //   () => ({
  //     location,
  //     history,
  //   }),
  //   [location, navigate],
  // );



  // localStorage.setItem("appName", appName)

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: "Quote List",
                  destination: "/quotelist",
                },

                {
                  label: "Email setting",
                  destination: "/emailsetting",
                },
                {
                  label: "Custom Script",
                  destination: "/customscript",
                },
                {
                  label: "Setting",
                  destination: "/setting",
                },
                {
                  label: "Pricing Plan",
                  destination: "/pricingplan",
                },
                {
                  label: "Quotes Form",
                  destination: "/QuoteForm",
                },
              ]}
            />
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
