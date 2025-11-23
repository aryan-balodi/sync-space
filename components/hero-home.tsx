import VideoThumb from '@/public/images/hero-image-01.jpg';
import ModalVideo from '@/components/modal-video';

export default function HeroHome() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-20">
            <h1
              className="font-nacelle animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,#d9601f,#393637,#FFFFFF,#d9601f,#393637)] bg-[length:200%_auto] bg-clip-text pb-5 text-4xl font-semibold text-transparent md:text-5xl"
              data-aos="fade-up"
            >
              Book Your Appointment with Professors Effortlessly at Manipal
              University Jaipur
            </h1>
            <div className="mx-auto max-w-3xl">
              <p
                className="mb-8 text-xl text-[#393637]/65"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                Choose your preferred professor and our seamless tool schedules
                your appointment and sends a confirmation email, making the
                booking process simple and efficient.
              </p>
              <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
                <div data-aos="fade-up" data-aos-delay={400}>
                  <a
                    className="btn group mb-4 w-full bg-gradient-to-t from-[#d9601f] to-[#393637] text-white shadow-md transition-transform hover:scale-105 sm:mb-0 sm:w-auto"
                    href="#0"
                  >
                    <span className="relative inline-flex items-center">
                      Book Appointment
                      <span className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5">
                        -&gt;
                      </span>
                    </span>
                  </a>
                </div>
                <div data-aos="fade-up" data-aos-delay={600}>
                  <a
                    className="btn relative w-full bg-gradient-to-b from-[#393637] to-[#393637]/60 text-gray-300 transition-transform hover:scale-105 sm:ml-4 sm:w-auto"
                    href="#0"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>

          <ModalVideo
            thumb={VideoThumb}
            thumbWidth={1104}
            thumbHeight={576}
            thumbAlt="Modal video thumbnail"
            video="videos//video.mp4"
            videoWidth={1920}
            videoHeight={1080}
          />
        </div>
      </div>
    </section>
  );
}
