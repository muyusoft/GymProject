import { Button } from "@/shared/components";
import { DemoGroup } from "./DemoGroup";

const noop = () => undefined;

export function ButtonDemo() {
  return (
    <>
      <DemoGroup title="Button · primary / secondary / ghost / danger">
        <Button variant="primary" label="Primary" icon="play" onPress={noop} />
        <Button variant="secondary" label="Secondary" onPress={noop} />
        <Button variant="ghost" label="Ghost" onPress={noop} />
        <Button variant="danger" label="Danger" icon="trash" onPress={noop} />
      </DemoGroup>
      <DemoGroup title="Button · block / disabled / loading">
        <Button label="Block" block onPress={noop} />
        <Button label="Disabled" block disabled onPress={noop} />
        <Button label="Loading" block loading onPress={noop} />
        <Button variant="secondary" label="Loading" block loading onPress={noop} />
      </DemoGroup>
    </>
  );
}
