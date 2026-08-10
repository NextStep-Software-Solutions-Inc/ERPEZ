import { useState } from "react";
import { plans } from "~/data/plans";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useNavigate } from "react-router";


export default function PlanPage() {
    const [isAnnual, setIsAnnual] = useState(false);
    const navigate = useNavigate();
    const isCustom = (val?: string) => {
        if (!val) return false;
        return /custom|contact/i.test(val);
    };

    return (
        <div className=" pt-12 px-14 lg:px-24 md:px-20 h-screen  ">
            <div className="text-center mb-16 max-w-6xl mx-auto">
                <div>
                    <div className="w-full flex flex-row justify-between items-center"><img src="/image/Logo1.png"
                        alt="ERPEZ Logo"
                        className="h-8 w-auto" />
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-[var(--button-blue)] hover:text-gray-800"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back
                        </button>
                    </div>
                    <h2 className="max-w-[1190px] mx-auto text-[42px] leading-[70px] font-bold text-black text-center">Choose Your Plan</h2>
                </div>
                <p className="max-w-3xl mx-auto text-slate-600 mt-6 text-lg leading-6 font-normal text-center tracking-[0.2px]">
                    Select the perfect plan for your tenant management needs. All plans include a 14-day free trial.
                </p>
                <div className=" pt-6 flex items-center justify-center gap-4">
                    <span className={isAnnual ? "text-muted-foreground" : "font-medium"}>Monthly</span>
                    <Switch
                        checked={isAnnual}
                        onCheckedChange={(v) => setIsAnnual(Boolean(v))}
                        aria-label="Toggle pricing period"
                    />
                    <span className={!isAnnual ? "text-muted-foreground" : "font-medium"}>Annual</span>
                </div>
            </div>
            <div className="grid gap-16 lg:grid-cols-3 max-w-6xl  mx-auto">
                {plans.map((plan) => (
                    <Card
                        key={plan.name}
                        className={`relative rounded-2xl shadow-md hover:shadow-xl transition ${plan.popular ? "border-[1px] border-[#2563EB] scale-110 px-4 bg-[#fcfdff]" : ""
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#2563EB] to-[#10B981] w-[158px] h-[50px] flex justify-center items-center text-white px-3 py-1 font-bold rounded-sm">
                                Most Popular
                            </div>

                        )}
                        <CardHeader className="text-center pt-8">
                            <CardTitle className="text-xl font-semibold ">{plan.name}</CardTitle>
                            <span className="flex items-baseline justify-center gap-2 mt-4"> 
                                {isAnnual ? (
                                    plan.annualPrice ? (
                                        <>
                                            {!isCustom(plan.price) && (
                                                <p className="text-sm text-muted-foreground line-through">{plan.price}</p>
                                            )}
                                            <p className="text-3xl font-bold mt-2">{plan.annualPrice}</p>
                                            {!isCustom(plan.annualPrice) && (
                                                <p className="text-sm text-muted-foreground">per year</p>
                                            )}
                                        </>
                                    ) : isCustom(plan.price) ? (
                                        <>
                                            <p className="text-3xl font-bold mt-2">{plan.price}</p>
                                            <p className="text-sm text-muted-foreground">per year</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-3xl font-bold mt-2">{plan.price}</p>
                                            <p className="text-sm text-muted-foreground">{plan.period}</p>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p className="text-3xl font-bold mt-2">{plan.price}</p>
                                        <p className="text-sm text-muted-foreground">{plan.period}</p>
                                    </>
                                )}

                            </span>
                            {isAnnual && plan.annualPriceSave && !isCustom(plan.price) && (
                                <span className="ml-2 text-sm text-green-600 font-medium">Save {plan.annualPriceSave}!</span>
                            )}
                            <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="px-8 flex flex-col justify-center">
                            <ul className="space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-center mt-6">
                                <Button
                                    className={`w-[69%] text-center ${plan.popular ? "btn-blue scale-115" : "btn-green"}`}
                                    variant={plan.buttonVariant as "default" | "secondary"}
                                >
                                    {plan.button}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}