PGDMP  (    +                 }            digiclo    17.1    17.1                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false                       1262    16526    digiclo    DATABASE     z   CREATE DATABASE digiclo WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Japanese_Japan.932';
    DROP DATABASE digiclo;
                     postgres    false                       0    0    DATABASE digiclo    ACL     (   GRANT ALL ON DATABASE digiclo TO dcdev;
                        postgres    false    4878                       0    0    digiclo    DATABASE PROPERTIES     4   ALTER DATABASE digiclo SET search_path TO 'public';
                          postgres    false                       0    0    SCHEMA public    ACL     %   GRANT ALL ON SCHEMA public TO dcdev;
                        pg_database_owner    false    5            �            1259    16641    clothes    TABLE     �   CREATE TABLE public.clothes (
    clotheid integer NOT NULL,
    clothetag character varying NOT NULL,
    clotheimage character varying NOT NULL,
    registerdate date DEFAULT CURRENT_DATE,
    userid character varying NOT NULL
);
    DROP TABLE public.clothes;
       public         heap r       postgres    false                       0    0    TABLE clothes    ACL     D   GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.clothes TO dcdev;
          public               postgres    false    219            �            1259    16640    clothes_clotheid_seq    SEQUENCE     �   CREATE SEQUENCE public.clothes_clotheid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.clothes_clotheid_seq;
       public               postgres    false    219                       0    0    clothes_clotheid_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.clothes_clotheid_seq OWNED BY public.clothes.clotheid;
          public               postgres    false    218            �            1259    16858 
   coordinate    TABLE     �   CREATE TABLE public.coordinate (
    userid character varying NOT NULL,
    coordinateid integer NOT NULL,
    clotheid integer NOT NULL,
    coordinatename character varying,
    madedate date DEFAULT CURRENT_DATE
);
    DROP TABLE public.coordinate;
       public         heap r       postgres    false                       0    0    TABLE coordinate    ACL     G   GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.coordinate TO dcdev;
          public               postgres    false    220            �            1259    16534    users    TABLE     �   CREATE TABLE public.users (
    userid character varying NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL
);
    DROP TABLE public.users;
       public         heap r       dcdev    false                       0    0    TABLE users    ACL     �   REVOKE ALL ON TABLE public.users FROM dcdev;
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE public.users TO dcdev;
          public               dcdev    false    217            `           2604    16644    clothes clotheid    DEFAULT     t   ALTER TABLE ONLY public.clothes ALTER COLUMN clotheid SET DEFAULT nextval('public.clothes_clotheid_seq'::regclass);
 ?   ALTER TABLE public.clothes ALTER COLUMN clotheid DROP DEFAULT;
       public               postgres    false    219    218    219                      0    16641    clothes 
   TABLE DATA           Y   COPY public.clothes (clotheid, clothetag, clotheimage, registerdate, userid) FROM stdin;
    public               postgres    false    219   ["                 0    16858 
   coordinate 
   TABLE DATA           ^   COPY public.coordinate (userid, coordinateid, clotheid, coordinatename, madedate) FROM stdin;
    public               postgres    false    220   �#                 0    16534    users 
   TABLE DATA           B   COPY public.users (userid, username, email, password) FROM stdin;
    public               dcdev    false    217   �#                  0    0    clothes_clotheid_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.clothes_clotheid_seq', 1, false);
          public               postgres    false    218            n           2606    16879    coordinate coordinate_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT coordinate_pkey PRIMARY KEY (coordinateid, clotheid, userid);
 D   ALTER TABLE ONLY public.coordinate DROP CONSTRAINT coordinate_pkey;
       public                 postgres    false    220    220    220            p           2606    16909    coordinate pk_coordinate 
   CONSTRAINT     m   ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT pk_coordinate UNIQUE (coordinateid, clotheid, userid);
 B   ALTER TABLE ONLY public.coordinate DROP CONSTRAINT pk_coordinate;
       public                 postgres    false    220    220    220            j           2606    16897    clothes pk_userid_clotheid 
   CONSTRAINT     f   ALTER TABLE ONLY public.clothes
    ADD CONSTRAINT pk_userid_clotheid PRIMARY KEY (userid, clotheid);
 D   ALTER TABLE ONLY public.clothes DROP CONSTRAINT pk_userid_clotheid;
       public                 postgres    false    219    219            l           2606    16651    clothes unique_clothe 
   CONSTRAINT     l   ALTER TABLE ONLY public.clothes
    ADD CONSTRAINT unique_clothe UNIQUE (clotheid, clothetag, clotheimage);
 ?   ALTER TABLE ONLY public.clothes DROP CONSTRAINT unique_clothe;
       public                 postgres    false    219    219    219            d           2606    16883    users unique_userid 
   CONSTRAINT     P   ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_userid UNIQUE (userid);
 =   ALTER TABLE ONLY public.users DROP CONSTRAINT unique_userid;
       public                 dcdev    false    217            f           2606    16542    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 dcdev    false    217            h           2606    16540    users users_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 dcdev    false    217            q           2606    16652    clothes clothes_userid_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.clothes
    ADD CONSTRAINT clothes_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);
 E   ALTER TABLE ONLY public.clothes DROP CONSTRAINT clothes_userid_fkey;
       public               postgres    false    4712    219    217            r           2606    16871 !   coordinate coordinate_userid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT coordinate_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(userid);
 K   ALTER TABLE ONLY public.coordinate DROP CONSTRAINT coordinate_userid_fkey;
       public               postgres    false    217    4712    220            s           2606    16903    coordinate fk_userid    FK CONSTRAINT     �   ALTER TABLE ONLY public.coordinate
    ADD CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES public.users(userid) ON UPDATE CASCADE ON DELETE CASCADE;
 >   ALTER TABLE ONLY public.coordinate DROP CONSTRAINT fk_userid;
       public               postgres    false    217    4712    220                       826    16533    DEFAULT PRIVILEGES FOR TABLES    DEFAULT ACL     r   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO dcdev;
          public               postgres    false                 x�}�An�0е9E`p�$[�D+�RG�F`a��6���4�V�Q��D,��W���At��`ƀ��f��Q֜�=����h�:��`U���R�w\���EK޳̲ʶ��o�A$"I�0���}Y�)��!�-��"Q�,\��qi�J+|K�<j2�-�OsXFqm��� �wL�;:p��yځ�%7C�r���]���(���+�����B<� z����A����ߩs:�'޴�:����Z�a����Z��:�'�xB[d�XO(��H�B�� ~ �i�R         ^   x��uvwI-�4��M[7O{ܴ�q�jN##]C#]3._�#�J�	)1��o^��i����ͽ��v�����#�Ђ��=... <�X@         �   x�e��
�0 �����m�@���ӡ-3"�K]��6���Gt	:�����d�L ��˲k�WB]�ݮ;,�[��b@��''�ܠ:���g7Mi�������Ä#ʌ�F���4�`>_����y����KL��=9#J��S_��@�,�V���x|l	�6��m�>     