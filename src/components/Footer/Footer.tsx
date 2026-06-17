import { useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "../../firebase";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
// import emailjs from "emailjs-com";

import "./styles.css";
import Loading from "../LoadingScreen";
import Alert from "../Alert";
import { Link } from "react-router-dom";
import { socialLinks } from "../../socialLinks";
// import EmailTemplate from "../EmailTemplate/EmailTemplate";

dayjs.extend(utc);

interface MessageSubmitForm {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
}

export function Footer() {
  const userMessagesRef = collection(db, "userMessages");

  const [instantMsgDetails, setInstantMsgDetails] = useState<MessageSubmitForm>(
    {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      timestamp: "",
    },
  );

  const tl = gsap.timeline();
  useEffect(() => {
    const ctx = gsap.context(() => {
      tl.to(".connector", {
        scrollTrigger: {
          trigger: ".connector",
          start: "top 95%",
          end: "bottom top",
          scrub: true,
          toggleActions: "play none none none",
          onEnter: () => {
            const connectorElement =
              document.querySelector<HTMLSpanElement>(".connector");
            const circleElement =
              document.querySelectorAll<HTMLSpanElement>(".connector-circle");
            const rippleEle =
              document.querySelectorAll<HTMLSpanElement>(".circle-ripple");

            if (connectorElement) {
              connectorElement.style.animation =
                "connector-expand 0.45s cubic-bezier(.82,0,.55,.89) forwards";
            }
            if (circleElement) {
              circleElement.forEach(
                (element) =>
                  (element.style.animation =
                    "connector-circle-reveal 0.3s 0.35s cubic-bezier(.38,-0.01,.32,2.52) forwards"),
              );
            }
            if (rippleEle)
              rippleEle.forEach(
                (element) =>
                  (element.style.animation =
                    "connector-circle-ripple 0.7s 0.4s cubic-bezier(0.34, 0.82, 0.36, 0.98) forwards"),
              );
          },
          onLeaveBack: () => {
            const connectorElement =
              document.querySelector<HTMLSpanElement>(".connector");
            const circleElement =
              document.querySelectorAll<HTMLSpanElement>(".connector-circle");
            const rippleEle =
              document.querySelectorAll<HTMLSpanElement>(".circle-ripple");

            if (connectorElement) {
              connectorElement.style.animation =
                "connector-expand-reset 0s cubic-bezier(.82,0,.55,.89) forwards";
            }
            if (circleElement) {
              circleElement.forEach(
                (element) =>
                  (element.style.animation =
                    "connector-circle-reveal-reset 0S ease-out forwards"),
              );
            }
            if (rippleEle)
              rippleEle.forEach(
                (element) =>
                  (element.style.animation =
                    "connector-circle-ripple-reset 0s cubic-bezier(0.34, 0.82, 0.36, 0.98) forwards"),
              );
          },
        },
      });
    });
    return () => ctx.revert();
  }, [tl]);

  const handleInstantMsgDetailsChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setInstantMsgDetails({ ...instantMsgDetails, [name]: value });
  };

  const getIntoFocus = (id: "firstName" | "lastName" | "email" | "message") => {
    const element = document.getElementById(id);
    if (element) element.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    Loading(true, "Sending message...");
    e.preventDefault();
    const { firstName, lastName, email, message } = instantMsgDetails;

    if (firstName.trim().length === 0) {
      getIntoFocus("firstName");
      Alert("First name cannot be empty", "warning");
    } else if (email.trim().length === 0) {
      getIntoFocus("email");
      Alert("Email cannot be empty", "warning");
    } else if (message.trim().length === 0) {
      getIntoFocus("message");
      Alert("Message cannot be empty", "warning");
    } else {
      const finalValues = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: dayjs.utc().format("DD MMM, YY (hh:mm A)"),
      };

      addDoc(userMessagesRef, finalValues)
        .then(async () => {
          setInstantMsgDetails({
            firstName: "",
            lastName: "",
            email: "",
            message: "",
            timestamp: "",
          });
          // await emailjs.send(
          //   import.meta.env.REACT_APP_EMAIL_SERVICE_ID as string,
          //   import.meta.env.REACT_APP_EMAIL_TEMPLATE_ID as string,
          //   {
          //     subject: `New portfolio message from ${finalValues.firstName} ${finalValues.lastName} 👀`,
          //     message: "Hello",
          //   }
          // );
          Alert("Message reached destination!", "success");
        })
        .catch((error) => {
          Alert("Sorry, there was an error...", "error");
          console.error("Error adding message:", error);
        })
        .finally(() => Loading(false));
      return;
    }
    Loading(false);
    return;
  };

  return (
    <footer
      className="bg-[#0a0807] border-t border-[#241f19] lg:px-12 flex flex-col lg:pt-12 md:px-6 md:pt-6 px-3 pt-3 text-[#efe9e1] mt-auto overflow-x-hidden dark-footer"
      id="contact-me"
    >
      <div className="flex flex-col items-center md:flex-row gap-x-12 gap-y-6">
        <p className="font-display font-[600] text-4xl lg:text-7xl md:text-6xl">
          Let's connect!
        </p>
        <div className="flex items-center justify-between w-full px-6 grow md:w-fit md:px-0 ">
          <span className="connector-circle">
            <span className="circle-ripple" />
          </span>
          <span className="connector bg-white w-0 h-[3px] duration-1000" />
          <span className="connector-circle">
            <span className="circle-ripple" />
          </span>
        </div>
      </div>

      <div className="grid items-start grid-cols-1 mt-14 lg:grid-cols-5 gap-x-12 gap-y-6">
        <div className="lg:col-span-3">
          <p className="text-3xl font-display font-[600] md:text-4xl">
            Send Instant Message
          </p>
          <form className="flex flex-col gap-3 mt-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex items-center gap-1">
                <span className="input-label grow" data-label="First Name">
                  <input
                    id="firstName"
                    required
                    name="firstName"
                    type="text"
                    className="p-2 rounded-l-md "
                    placeholder=""
                    value={instantMsgDetails.firstName}
                    onChange={handleInstantMsgDetailsChange}
                  />
                </span>
                <span className="input-label grow" data-label="Last Name">
                  <input
                    id="lastName"
                    required
                    name="lastName"
                    type="text"
                    className="p-2 rounded-r-md"
                    placeholder=""
                    value={instantMsgDetails.lastName}
                    onChange={handleInstantMsgDetailsChange}
                  />
                </span>
              </div>
              <span className="input-label grow" data-label="Email">
                <input
                  id="email"
                  required
                  type="email"
                  name="email"
                  className="p-2 rounded-md"
                  placeholder=""
                  value={instantMsgDetails.email}
                  onChange={handleInstantMsgDetailsChange}
                  autoComplete="off"
                />
              </span>
            </div>

            <div className="col-span-2 grow">
              <div
                className="input-label"
                data-label="Message"
                data-message={`${instantMsgDetails.message.length}/500`}
              >
                <textarea
                  id="message"
                  required
                  name="message"
                  className="p-2 rounded-md resize-none h-52"
                  placeholder=""
                  value={instantMsgDetails.message}
                  onChange={handleInstantMsgDetailsChange}
                  maxLength={500}
                />
              </div>
            </div>
            <div className="ml-auto">
              <button className="px-3 py-1 text-2xl font-semibold border-2 rounded-md inst-msg-send __cursor-difference">
                Send
              </button>
            </div>
          </form>
        </div>

        <div className="self-stretch lg:col-span-2">
          <p className="text-4xl font-display font-[600] text-center">
            Find me on socials
          </p>
          <div className="flex flex-col items-center justify-center gap-3 mt-12 text-xl">
            {socialLinks.map(({ name, url, username, color, id }, indx) => (
              <div className="social-link" key={indx}>
                <span>{name}</span>
                <Link
                  target="_blank"
                  to={url}
                  className={`${color} __custom-cursor-social`}
                  id={`social-${id}`}
                >
                  {username}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-16 -mx-12 overflow-hidden border-y border-neutral-800 py-3"
        aria-hidden="true"
      >
        <div className="__marquee-track font-mono text-sm uppercase tracking-widest text-neutral-500">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-16 shrink-0">
              <span>kaustubh paturi</span>
              <span>—</span>
              <span>application developer</span>
              <span>—</span>
              <span>full-stack</span>
              <span>—</span>
              <span>open to work</span>
              <span>—</span>
              <span>kaustubh paturi</span>
              <span>—</span>
              <span>application developer</span>
              <span>—</span>
              <span>full-stack</span>
              <span>—</span>
              <span>open to work</span>
              <span>—</span>
            </span>
          ))}
        </div>
      </div>

      <p className="mt-8 footer-name __cursor-difference">Kaustubh Paturi</p>

      <div className="flex flex-col gap-4 mb-4 text-center">
        <p className="text-neutral-300 ">Nothing great ever came that easy</p>
        <div className="flex flex-col">
          <p className="text-neutral-700">
            © {new Date().getFullYear()} Kaustubh Paturi
          </p>
          <p className="text-neutral-700">All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
