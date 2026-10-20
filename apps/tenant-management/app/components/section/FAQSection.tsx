import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { faqs } from "~/data/faq"
export default function FAQSection() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([])
  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index] 
    )
  }

  return (
    <section className="relative py-28 px-6 lg:px-20 text-white bg-gradient-to-tr from-[#2563EB] to-[#10B981]" id="faq">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <p className="uppercase tracking-widest text-sm font-semibold text-white">
          FAQs
        </p>
        <h2 className="text-3xl lg:text-4xl font-bold mt-2">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-white/30 pb-4 transition-colors"
          >
            <button
              onClick={() => toggleIndex(index)}
              className="flex justify-between items-center w-full text-left text-lg font-medium hover:text-green-200"
            >
              {faq.question}
              {openIndexes.includes(index) ? (
                <Minus className="w-5 h-5 text-green-300" />
              ) : (
                  <Plus className="w-5 h-5 text-blue-300" />
              )}
            </button>
            {openIndexes.includes(index) && (
              <p className="mt-3 text-sm text-white/90">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center mt-10 text-sm">
        <p>
          Can&#39;t find the answer you&#39;re looking for? Reach out to our{" "}
          <a href="#contact" className="font-semibold underline cursor-pointer hover:text-green-300 transition-colors">
            customer support team
          </a>.
        </p>
      </div>
    </section>
  )
}
