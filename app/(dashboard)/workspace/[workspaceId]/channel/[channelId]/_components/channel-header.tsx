import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FC } from "react";
import { InviteMember } from "./member/invite-member";

type ChannelHeaderProps = {
  channelName: string | undefined;
};

export const ChannelHeader: FC<ChannelHeaderProps> = ({ channelName }) => {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b">
      <h1 className="text-lg font-semibold">#{channelName}</h1>

      <div className="flex items-center space-x-3">
        <InviteMember />
        <ThemeToggle />
      </div>
    </div>
  );
};
