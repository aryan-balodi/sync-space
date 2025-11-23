import Image from 'next/image';
import Illustration from '@/public/images/page-illustration.svg';
import BlurredShapeGray from '@/public/images/blurred-shape-gray.svg';
import BlurredShape from '@/public/images/blurred-shape.svg';

export default function PageIllustration({
  multiple = false,
}: {
  multiple?: boolean;
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 -translate-x-1/4"
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={Illustration}
          width={846}
          height={594}
          alt="Page illustration"
        />
      </div>
      {multiple && (
        <>
          <div
            className="pointer-events-none absolute top-[400px] left-1/2 -z-10 -mt-20 -translate-x-full opacity-50"
            aria-hidden="true"
          >
            <Image
              className="max-w-none"
              src={BlurredShapeGray}
              width={760}
              height={668}
              alt="Blurred shape"
            />
          </div>
          <div
            className="pointer-events-none absolute top-[440px] left-1/2 -z-10 -translate-x-1/3"
            aria-hidden="true"
          >
            <Image
              className="max-w-none"
              src={BlurredShape}
              width={760}
              height={668}
              alt="Blurred shape"
            />
          </div>
        </>
      )}
    </>
  );
}
