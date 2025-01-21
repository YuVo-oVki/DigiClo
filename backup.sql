--
-- PostgreSQL database dump
--

-- Dumped from database version 17.1
-- Dumped by pg_dump version 17.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clothes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clothes (
    clotheid integer NOT NULL,
    clothetag character varying NOT NULL,
    clotheimage character varying NOT NULL,
    registerdate date DEFAULT CURRENT_DATE,
    userid character varying NOT NULL
);


ALTER TABLE public.clothes OWNER TO postgres;

--
-- Name: clothes_clotheid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clothes_clotheid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clothes_clotheid_seq OWNER TO postgres;

--
-- Name: clothes_clotheid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clothes_clotheid_seq OWNED BY public.clothes.clotheid;


--
-- Name: coordinate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coordinate (
    userid character varying NOT NULL,
    coordinateid integer NOT NULL,
    clotheid integer NOT NULL,
    coordinatename character varying,
    madedate date DEFAULT CURRENT_DATE
);


ALTER TABLE public.coordinate OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: dcdev
--

CREATE TABLE public.users (
    userid character varying NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL
);


ALTER TABLE public.users OWNER TO dcdev;

--
-- Name: clothes clotheid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clothes ALTER COLUMN clotheid SET DEFAULT nextval('public.clothes_clotheid_seq'::regclass);


--
-- Data for Name: clothes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clothes (clotheid, clothetag, clotheimage, registerdate, userid) FROM stdin;
2	Sunglasses,Bracelet,IndianRed,WhiteSmoke,Black,DarkGray,DimGray	/images/clothes/clothe17.png	2024-12-06	MCGDev
1	T-Shirt,DarkSlateGray,Gainsboro,Gray	/images/clothes/clothe16.png	2024-12-06	MCGDev
4	T-Shirt,Black,Gray,Gainsboro	/images/clothes/clothe1.png	2025-01-08	MCGDev
5	Blazer,Pant Suit,Black,DimGray,DarkGray	/images/clothes/clothe2.png	2025-01-08	MCGDev
6	Black,Gray	/images/clothes/clothe3.png	2025-01-08	MCGDev
3	DarkSlateGray,Silver,DimGray,冬	/images/clothes/clothe22.png	2024-12-06	MCGDev
8	Sweater,Hoodies,PowderBlue,LightSlateGray,Tan,DarkSlateGray	/images/clothes/clothe5.png	2025-01-09	MCGDev
7	Robe	/images/clothes/clothe4.png	2025-01-09	MCGDev
9	test	/images/clothes/clothe6.png	2025-01-20	MCGDev
\.


--
-- Data for Name: coordinate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coordinate (userid, coordinateid, clotheid, coordinatename, madedate) FROM stdin;
MCGDev	1	1	サブカル	2024-12-06
MCGDev	1	2	サブカル	2024-12-06
MCGDev	1	3	サブカル	2024-12-06
MCGDev	2	2	ブライトネス	2025-01-17
MCGDev	2	3	ブライトネス	2025-01-17
MCGDev	2	8	ブライトネス	2025-01-17
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: dcdev
--

COPY public.users (userid, username, email, password) FROM stdin;
MCGDev	MusubiSoft	MusubiSoft@gmail.com	$2b$10$EQs03TpHG3H8ye0cFv9B8OkrJJI3LRtyHppcBHb0JOt72EO3mLfYG
\.


--
-- Name: clothes_clotheid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clothes_clotheid_seq', 1, false);


--
-- Name: coordinate coordinate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT coordinate_pkey PRIMARY KEY (coordinateid, clotheid, userid);


--
-- Name: coordinate pk_coordinate; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT pk_coordinate UNIQUE (coordinateid, clotheid, userid);


--
-- Name: clothes pk_userid_clotheid; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clothes
    ADD CONSTRAINT pk_userid_clotheid PRIMARY KEY (userid, clotheid);


--
-- Name: clothes unique_clothe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clothes
    ADD CONSTRAINT unique_clothe UNIQUE (clotheid, clothetag, clotheimage);


--
-- Name: users unique_userid; Type: CONSTRAINT; Schema: public; Owner: dcdev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_userid UNIQUE (userid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: dcdev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: dcdev
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- Name: clothes clothes_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clothes
    ADD CONSTRAINT clothes_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: coordinate coordinate_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT coordinate_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);


--
-- Name: coordinate fk_userid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO dcdev;


--
-- Name: TABLE clothes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.clothes TO dcdev;


--
-- Name: TABLE coordinate; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.coordinate TO dcdev;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: dcdev
--

REVOKE ALL ON TABLE public.users FROM dcdev;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.users TO dcdev;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO dcdev;


--
-- PostgreSQL database dump complete
--

