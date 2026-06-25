import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <>
            <section className="max-w-4xl mx-auto px-8 py-28 text-center">
                <h1 className="text-5xl font-bold text-neutral-900 leading-tight mb-6">
                    Plan your goals.
                    <br />
                    Track your progress.
                </h1>

                <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto">
                    Stride helps you break down your goals into daily achievable tasks.
                    Every completed task moves you forward towards your goal.
                </p>
                <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-400 hover:-translate-y-0.5 transition-all duration-200"
                >
                    Start Now <ArrowRight size={18} />
                </Link>
            </section>
        </>
    )
}

export default Hero;
