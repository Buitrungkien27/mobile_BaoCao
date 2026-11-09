import { useMemo, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, CheckCircle2, QrCode } from "@tamagui/lucide-icons";
import { Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { submitCheckIn } from "../services/eventApi";
import { useEventContext } from "../context/EventContext";
import { ActionButton, Heading, palette, ui } from "../theme/ui";
import { CheckInResult } from "../types/event";

export function CheckInScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [code, setCode] = useState("EVENTMATE:ev-mobile-workshop");
  const [result, setResult] = useState<CheckInResult | null>(null);
  const { registrations, checkedInIds, markCheckedIn } = useEventContext();
  const registeredEventIds = useMemo(
    () => registrations.filter((item) => item.status === "confirmed").map((item) => item.eventId),
    [registrations]
  );

  async function handleCode(raw: string) {
    if (scanned) return;
    setScanned(true);
    setResult(null);
    try {
      const response = await submitCheckIn(raw, { registeredEventIds, checkedInIds });
      if (response.status === "accepted") markCheckedIn(response.eventId);
      setResult(response);
    } catch {
      setResult({ eventId: "", status: "invalid", message: "Chưa thể check-in. Vui lòng thử lại." });
    } finally {
      setScanned(false);
    }
  }

  const resultColor = result?.status === "accepted" ? palette.green
    : result?.status === "duplicate" ? "#B4780A" : palette.pink;

  return <Screen scroll>
    <Heading title="Check-in sự kiện" subtitle="Chỉ check-in sự kiện bạn đã đăng ký." />
    {registeredEventIds.length === 0 ? <View style={{ padding: 14, borderRadius: 8, backgroundColor: "#FFF5DD", marginBottom: 16 }}>
      <Text style={[ui.body, { marginBottom: 10 }]}>Bạn chưa có sự kiện nào được đăng ký. Hãy đăng ký trước khi check-in.</Text>
      <ActionButton secondary label="Khám phá sự kiện" onPress={() => navigation.navigate("Events")} />
    </View> : null}
    <View style={{ width: "100%", aspectRatio: 1.15, backgroundColor: "#EAF1FF", borderRadius: 8, overflow: "hidden", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
      {permission?.granted
        ? <CameraView style={{ width: "100%", height: "100%" }} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={scanned || result ? undefined : ({ data }) => { void handleCode(data); }} />
        : <View style={{ alignItems: "center", gap: 14, padding: 25 }}><QrCode size={90} color={palette.blue} /><Text style={[ui.sectionTitle, { textAlign: "center" }]}>Quét mã tại sự kiện</Text><Text style={[ui.muted, { textAlign: "center" }]}>Nếu chưa cấp quyền camera, bạn vẫn có thể nhập mã bên dưới.</Text></View>}
    </View>
    {!permission?.granted
      ? <ActionButton label="Mở camera" icon={<Camera size={18} color="white" />} onPress={() => { requestPermission().catch(() => setResult({ eventId: "", status: "invalid", message: "Không thể mở camera. Bạn có thể nhập mã bên dưới." })); }} />
      : <ActionButton secondary label="Quét mã mới" onPress={() => setResult(null)} />}
    <View style={ui.divider} />
    <Text style={[ui.sectionTitle, { marginBottom: 10 }]}>Nhập mã check-in</Text>
    <TextInput accessibilityLabel="Mã check-in" style={ui.input} placeholder="EVENTMATE:mã-sự-kiện" value={code} onChangeText={setCode} autoCapitalize="none" />
    <View style={{ marginTop: 12 }}><ActionButton secondary label={scanned ? "Đang xác nhận..." : "Xác nhận check-in"} onPress={() => { void handleCode(code); }} disabled={scanned || !code.trim()} /></View>
    {result ? <View style={[ui.row, { marginTop: 18, alignItems: "flex-start" }]}><CheckCircle2 size={20} color={resultColor} /><Text accessibilityLiveRegion="polite" style={[ui.body, { flex: 1, color: resultColor }]}>{result.message}</Text></View> : null}
  </Screen>;
}
