
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {

  const { pathname, search } = useLocation();

  useEffect(() => {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    document.body.scrollTop = 0;

  }, [pathname, search]);


  useEffect(() => {

    const resetScrollPosition = () => {

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

    };

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    resetScrollPosition();

    window.addEventListener("pageshow", resetScrollPosition);

    return () => {
      window.removeEventListener("pageshow", resetScrollPosition);
    };

  }, []);


  return null;
};

export default ScrollToTop;