import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        await dbConnect();

        // Explicitly select passwordHash (it has select: false on the model)
        const user = await User.findOne({ email: credentials.email.toLowerCase() })
          .select("+passwordHash")
          .lean();

        if (!user) {
          throw new Error("No account found with that email.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id;
        session.user.name = token.name;
      }
      return session;
    },
  },

  pages: {
    signIn: "/",   // Stay on homepage — we use a modal, not a separate page
  },

  secret: process.env.NEXTAUTH_SECRET,
};
