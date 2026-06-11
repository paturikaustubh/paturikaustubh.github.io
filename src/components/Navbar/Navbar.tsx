import { Link, useLocation, useNavigate } from "react-router-dom";

import "./styles.css";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const locArr = pathname.split("/").filter((value) => value !== "");

  const navMenuElementStyle = "px-4 py-6 overflow-hidden border-t expand-bg font-display";

  const handleContactClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const contactMeElement = document.getElementById("contact-me");
    if (contactMeElement) {
      contactMeElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const navigationMenu = document.getElementById("navigation-menu");
    if (navigationMenu && navigationMenu.classList.contains("__show")) {
      navigationMenu.style.height = "0";
      setTimeout(() => {
        navigationMenu.classList.remove("__show");
      }, 300);
    }
  };

  const menuLinks = [
    {
      to: "",
      title: "Home",
      id: "nav-home",
    },
    {
      to: "projects",
      title: "Projects",
      id: "nav-projects",
    },
    {
      to: "https://drive.google.com/file/d/1MfsXpNlgKppnHvmwcpzISwZCl99xdEj5/view?usp=drive_link",
      title: "Resume",
      id: "nav-resume",
    },
  ];

  return (
    <>
      <div
        id="navigation-menu"
        className="fixed inset-0 overflow-hidden block md:hidden justify-between z-[21]"
      >
        <div className="flex flex-col justify-between h-full py-5">
          <section className="flex items-center justify-between px-4 pb-5 text-4xl border-b">
            <span>Menu</span>
            <button
              className="border-0 material-symbols-outlined outline-0"
              onClick={() => {
                const navigationMenu =
                  document.getElementById("navigation-menu");
                if (navigationMenu) {
                  navigationMenu.style.height = "0";
                  setTimeout(() => {
                    navigationMenu.classList.remove("__show");
                  }, 300);
                }
              }}
            >
              close
            </button>
          </section>
          <section className="flex flex-col text-[2.2rem] __nav-menu-element-list">
            {menuLinks.map(({ to, title, id }, indx) => (
              <Link
                to={title !== "Resume" ? `/${to}` : to}
                target={title === "Resume" ? "_blank" : "_self"}
                className={navMenuElementStyle}
                id={id}
                data-testid={id}
                onClick={() => {
                  const navigationMenu =
                    document.getElementById("navigation-menu");
                  if (navigationMenu) {
                    navigationMenu.style.height = "0";
                    setTimeout(() => {
                      navigationMenu.classList.remove("__show");
                    }, 300);
                  }
                }}
                key={indx}
                style={{ animationDelay: `${150 + indx * 100}ms` }}
              >
                {title}
              </Link>
            ))}
            <button
              className={navMenuElementStyle + " contact-btn"}
              onClick={handleContactClick}
              data-testid="nav-contact-me"
              style={{ animationDelay: `${150 + menuLinks.length * 100}ms` }}
            >
              Contact Me
            </button>
          </section>
        </div>
      </div>

      {/* ANCHOR NAVBAR */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between w-full px-4 py-5 lg:px-16 md:px-8 __cursor-nav"
      >
        <div className="flex items-center gap-4">
          {locArr.length > 0 && (
            <button
              onClick={() => navigate(-1)}
              className="material-symbols-outlined"
            >
              west
            </button>
          )}
          <Link to={"/"}>
            <svg
              id="logo"
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              width="203"
              height="28"
              viewBox="0 0 203 28"
            >
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(255,255,255,0)"
              />
              <g transform="matrix(1 0 0 1 101.75 13.56)" id="629671">
                <path
                  fontFamily="Poppins"
                  fontSize="24"
                  fontStyle="normal"
                  fontWeight="bold"
                  d="M-85.48 7.54L-90.49 7.54L-96.16 0.10L-96.16 7.54L-100.26 7.54L-100.26-9.31L-96.16-9.31L-96.16-1.92L-90.54-9.31L-85.72-9.31L-92.25-1.05L-85.48 7.54ZM-84.35 0.82Q-84.35-1.24-83.57-2.80Q-82.79-4.36-81.45-5.20Q-80.10-6.04-78.45-6.04L-78.45-6.04Q-77.03-6.04-75.96-5.47Q-74.89-4.89-74.32-3.96L-74.32-3.96L-74.32-5.85L-70.21-5.85L-70.21 7.54L-74.32 7.54L-74.32 5.64Q-74.92 6.58-75.99 7.16Q-77.05 7.73-78.47 7.73L-78.47 7.73Q-80.10 7.73-81.45 6.88Q-82.79 6.03-83.57 4.46Q-84.35 2.88-84.35 0.82L-84.35 0.82ZM-74.32 0.84Q-74.32-0.69-75.17-1.58Q-76.02-2.47-77.25-2.47L-77.25-2.47Q-78.47-2.47-79.32-1.59Q-80.17-0.72-80.17 0.82L-80.17 0.82Q-80.17 2.36-79.32 3.26Q-78.47 4.16-77.25 4.16L-77.25 4.16Q-76.02 4.16-75.17 3.27Q-74.32 2.38-74.32 0.84L-74.32 0.84ZM-58.12-5.85L-54.01-5.85L-54.01 7.54L-58.12 7.54L-58.12 5.72Q-58.74 6.60-59.81 7.14Q-60.88 7.68-62.17 7.68L-62.17 7.68Q-63.71 7.68-64.89 7.00Q-66.06 6.32-66.71 5.02Q-67.36 3.72-67.36 1.97L-67.36 1.97L-67.36-5.85L-63.28-5.85L-63.28 1.42Q-63.28 2.76-62.58 3.51Q-61.89 4.25-60.71 4.25L-60.71 4.25Q-59.51 4.25-58.81 3.51Q-58.12 2.76-58.12 1.42L-58.12 1.42L-58.12-5.85ZM-45.61 7.73Q-47.37 7.73-48.73 7.13Q-50.10 6.53-50.89 5.49Q-51.69 4.44-51.78 3.15L-51.78 3.15L-47.73 3.15Q-47.65 3.84-47.08 4.28Q-46.50 4.71-45.66 4.71L-45.66 4.71Q-44.89 4.71-44.47 4.41Q-44.05 4.11-44.05 3.63L-44.05 3.63Q-44.05 3.05-44.65 2.78Q-45.25 2.50-46.60 2.16L-46.60 2.16Q-48.04 1.83-49.00 1.46Q-49.96 1.08-50.65 0.28Q-51.35-0.52-51.35-1.89L-51.35-1.89Q-51.35-3.04-50.71-3.99Q-50.08-4.94-48.84-5.49Q-47.61-6.04-45.90-6.04L-45.90-6.04Q-43.38-6.04-41.93-4.80Q-40.48-3.55-40.26-1.48L-40.26-1.48L-44.05-1.48Q-44.15-2.18-44.67-2.59Q-45.18-3.00-46.02-3.00L-46.02-3.00Q-46.74-3.00-47.13-2.72Q-47.51-2.44-47.51-1.96L-47.51-1.96Q-47.51-1.39-46.90-1.10Q-46.29-0.81-44.99-0.52L-44.99-0.52Q-43.50-0.14-42.57 0.23Q-41.63 0.60-40.92 1.43Q-40.21 2.26-40.19 3.65L-40.19 3.65Q-40.19 4.83-40.85 5.75Q-41.51 6.68-42.75 7.20Q-43.98 7.73-45.61 7.73L-45.61 7.73ZM-31.67 4.06L-30.21 4.06L-30.21 7.54L-32.29 7.54Q-34.53 7.54-35.77 6.45Q-37.02 5.36-37.02 2.88L-37.02 2.88L-37.02-2.44L-38.65-2.44L-38.65-5.85L-37.02-5.85L-37.02-9.12L-32.92-9.12L-32.92-5.85L-30.23-5.85L-30.23-2.44L-32.92-2.44L-32.92 2.93Q-32.92 3.53-32.63 3.80Q-32.34 4.06-31.67 4.06L-31.67 4.06ZM-18.81-5.85L-14.70-5.85L-14.70 7.54L-18.81 7.54L-18.81 5.72Q-19.43 6.60-20.50 7.14Q-21.57 7.68-22.86 7.68L-22.86 7.68Q-24.40 7.68-25.57 7.00Q-26.75 6.32-27.40 5.02Q-28.05 3.72-28.05 1.97L-28.05 1.97L-28.05-5.85L-23.97-5.85L-23.97 1.42Q-23.97 2.76-23.27 3.51Q-22.57 4.25-21.40 4.25L-21.40 4.25Q-20.20 4.25-19.50 3.51Q-18.81 2.76-18.81 1.42L-18.81 1.42L-18.81-5.85ZM-7.65-3.96Q-7.07-4.89-5.99-5.47Q-4.91-6.04-3.52-6.04L-3.52-6.04Q-1.86-6.04-0.52-5.20Q0.83-4.36 1.61-2.80Q2.39-1.24 2.39 0.82L2.39 0.82Q2.39 2.88 1.61 4.46Q0.83 6.03-0.52 6.88Q-1.86 7.73-3.52 7.73L-3.52 7.73Q-4.93 7.73-5.99 7.17Q-7.05 6.60-7.65 5.67L-7.65 5.67L-7.65 7.54L-11.75 7.54L-11.75-10.22L-7.65-10.22L-7.65-3.96ZM-1.79 0.82Q-1.79-0.72-2.64-1.59Q-3.49-2.47-4.74-2.47L-4.74-2.47Q-5.97-2.47-6.82-1.58Q-7.67-0.69-7.67 0.84L-7.67 0.84Q-7.67 2.38-6.82 3.27Q-5.97 4.16-4.74 4.16L-4.74 4.16Q-3.52 4.16-2.65 3.26Q-1.79 2.36-1.79 0.82L-1.79 0.82ZM12.78-6.00Q15.08-6.00 16.47-4.47Q17.87-2.95 17.87-0.28L17.87-0.28L17.87 7.54L13.79 7.54L13.79 0.27Q13.79-1.08 13.09-1.82Q12.39-2.56 11.22-2.56L11.22-2.56Q10.04-2.56 9.35-1.82Q8.65-1.08 8.65 0.27L8.65 0.27L8.65 7.54L4.55 7.54L4.55-10.22L8.65-10.22L8.65-4.05Q9.27-4.94 10.35-5.47Q11.43-6.00 12.78-6.00L12.78-6.00ZM38.65-3.88Q38.65-2.42 37.98-1.21Q37.31 0.00 35.91 0.75Q34.52 1.49 32.46 1.49L32.46 1.49L29.91 1.49L29.91 7.54L25.81 7.54L25.81-9.31L32.46-9.31Q34.47-9.31 35.87-8.61Q37.26-7.92 37.95-6.69Q38.65-5.47 38.65-3.88L38.65-3.88ZM32.15-1.77Q33.32-1.77 33.90-2.32Q34.47-2.88 34.47-3.88L34.47-3.88Q34.47-4.89 33.90-5.44Q33.32-6.00 32.15-6.00L32.15-6.00L29.91-6.00L29.91-1.77L32.15-1.77ZM39.97 0.82Q39.97-1.24 40.75-2.80Q41.53-4.36 42.87-5.20Q44.22-6.04 45.87-6.04L45.87-6.04Q47.29-6.04 48.36-5.47Q49.43-4.89 50.00-3.96L50.00-3.96L50.00-5.85L54.11-5.85L54.11 7.54L50.00 7.54L50.00 5.64Q49.40 6.58 48.33 7.16Q47.27 7.73 45.85 7.73L45.85 7.73Q44.22 7.73 42.87 6.88Q41.53 6.03 40.75 4.46Q39.97 2.88 39.97 0.82L39.97 0.82ZM50.00 0.84Q50.00-0.69 49.15-1.58Q48.30-2.47 47.07-2.47L47.07-2.47Q45.85-2.47 45.00-1.59Q44.15-0.72 44.15 0.82L44.15 0.82Q44.15 2.36 45.00 3.26Q45.85 4.16 47.07 4.16L47.07 4.16Q48.30 4.16 49.15 3.27Q50.00 2.38 50.00 0.84L50.00 0.84ZM63.08 4.06L64.55 4.06L64.55 7.54L62.46 7.54Q60.23 7.54 58.98 6.45Q57.73 5.36 57.73 2.88L57.73 2.88L57.73-2.44L56.10-2.44L56.10-5.85L57.73-5.85L57.73-9.12L61.83-9.12L61.83-5.85L64.52-5.85L64.52-2.44L61.83-2.44L61.83 2.93Q61.83 3.53 62.12 3.80Q62.41 4.06 63.08 4.06L63.08 4.06ZM75.95-5.85L80.05-5.85L80.05 7.54L75.95 7.54L75.95 5.72Q75.32 6.60 74.25 7.14Q73.19 7.68 71.89 7.68L71.89 7.68Q70.35 7.68 69.18 7.00Q68.00 6.32 67.35 5.02Q66.71 3.72 66.71 1.97L66.71 1.97L66.71-5.85L70.79-5.85L70.79 1.42Q70.79 2.76 71.48 3.51Q72.18 4.25 73.35 4.25L73.35 4.25Q74.55 4.25 75.25 3.51Q75.95 2.76 75.95 1.42L75.95 1.42L75.95-5.85ZM87.11-3.62Q87.83-4.72 88.91-5.36Q89.99-6.00 91.31-6.00L91.31-6.00L91.31-1.65L90.18-1.65Q88.64-1.65 87.87-0.99Q87.11-0.33 87.11 1.32L87.11 1.32L87.11 7.54L83.00 7.54L83.00-5.85L87.11-5.85L87.11-3.62ZM95.34-7.24Q94.26-7.24 93.57-7.88Q92.89-8.52 92.89-9.45L92.89-9.45Q92.89-10.41 93.57-11.05Q94.26-11.68 95.34-11.68L95.34-11.68Q96.39-11.68 97.08-11.05Q97.76-10.41 97.76-9.45L97.76-9.45Q97.76-8.52 97.08-7.88Q96.39-7.24 95.34-7.24L95.34-7.24ZM93.27-5.85L97.38-5.85L97.38 7.54L93.27 7.54L93.27-5.85Z"
                />
              </g>
            </svg>
          </Link>
        </div>
        <div className="flex md:hidden">
          <button
            className="border-0 material-symbols-outlined outline-0"
            onClick={() => {
              const navigationMenu = document.getElementById("navigation-menu");
              if (navigationMenu) {
                navigationMenu.classList.add("__show");
                navigationMenu.style.height = "100dvh";
              }
            }}
          >
            menu
          </button>
        </div>
        <div className="items-center hidden gap-8 navigation md:flex">
          {menuLinks.map(({ to, title, id }, indx) => (
            <Link
              key={indx}
              to={title !== "Resume" ? `/${to}` : to}
              target={title === "Resume" ? "_blank" : "_self"}
              className="__nav-underline-element font-mono text-sm uppercase tracking-widest"
              data-testid={id}
            >
              {title}
            </Link>
          ))}
          <button
            className="__nav-underline-element font-mono text-sm uppercase tracking-widest"
            onClick={handleContactClick}
            data-testid="nav-contact-me"
          >
            Contact Me
          </button>
        </div>
      </nav>
    </>
  );
}
