import Image from "next/image";

import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-[calc(100vh/var(--app-zoom))] w-[calc(100vw/var(--app-zoom))] items-start justify-center overflow-x-hidden bg-white px-4 pb-12 pt-[160px] text-[#4f4539] sm:px-6 lg:px-10">
      <div className="absolute inset-x-0 bottom-[-120px] top-0">
        <Image
          src="/auth/santorini-cliffside.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-[#f6f1e8]/35 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-0" />
      </div>

      <section className="relative flex min-h-[820px] w-full max-w-[552px] flex-col items-center rounded-[24px] border border-black bg-[#fdfdfd] px-5 py-10 shadow-[0_28px_80px_rgba(47,38,25,0.24)] sm:px-9 sm:py-[54px] lg:min-h-[922px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/auth/greek-temple.svg"
            alt=""
            width={269}
            height={269}
            className="size-[190px] sm:size-[240px] lg:size-[269px]"
          />
          <p className="mt-1 font-lexend text-[28px] font-bold leading-none text-[#c89b5b] sm:text-[32px]">
            GLOSIO
          </p>
          <p className="mt-6 text-[18px] leading-normal text-black sm:text-[24px]">
            A Greek Learning Companion
          </p>
        </div>

        <ForgotPasswordForm />
      </section>
    </main>
  );
}
