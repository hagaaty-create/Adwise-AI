import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, ShieldCheck, Globe, InfinityIcon } from "lucide-react";

const agencyFeatures = [
    {
      icon: <InfinityIcon className="h-5 w-5 text-primary" />,
      text: "Unlimited Google ad accounts",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      text: "Accounts protected against random closure",
    },
    {
      icon: <Globe className="h-5 w-5 text-primary" />,
      text: "Target all countries with no spending limits",
    },
    {
      icon: <Check className="h-5 w-5 text-primary" />,
      text: "Support for Google Ads platform",
    },
    {
      icon: <Star className="h-5 w-5 text-primary" />,
      text: "Priority customer support",
    },
];

export default function SubscriptionPage() {
    return (
      <div className="flex justify-center items-start pt-8">
        <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">Agency Plan</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    Unlock powerful features for your agency and scale your Google advertising efforts.
                </CardDescription>
                <div className="pt-4">
                    <span className="text-5xl font-extrabold">$50</span>
                    <span className="text-xl text-muted-foreground">/year</span>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {agencyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-4">
                            {feature.icon}
                            <span className="font-medium">{feature.text}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button size="lg" className="w-full text-lg">
                    Subscribe Now
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )
}
