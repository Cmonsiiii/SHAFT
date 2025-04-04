import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

// Pre-generate year range (1970–2020)
const YEARS = Array.from({ length: 51 }, (_, i) => 1970 + i);
// Pre-generate days (1–31)
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface BirthdateProps {
    value?: { day: number; month: number; year: number };
    setValue?: (value: { day: number; month: number; year: number }) => void;
    error?: string;
}


const BirthdateSelector: React.FC<BirthdateProps> = ({
    value = { day: 0, month: 0, year: 0 },
    setValue,
    error,
}) => {
    const colorScheme = useColorScheme();
    const [isFocused, setFocused] = useState(false);

    const [availableDays, setAvailableDays] = useState<number[]>(DAYS);

    const months = React.useMemo(
        () => [
            { label: "Jan", value: 1 },
            { label: "Feb", value: 2 },
            { label: "Mar", value: 3 },
            { label: "Apr", value: 4 },
            { label: "May", value: 5 },
            { label: "Jun", value: 6 },
            { label: "Jul", value: 7 },
            { label: "Aug", value: 8 },
            { label: "Sep", value: 9 },
            { label: "Oct", value: 10 },
            { label: "Nov", value: 11 },
            { label: "Dec", value: 12 },
        ],
        []
    );



    React.useEffect(() => {
        const daysInMonth = new Date(value.year, value.month, 0).getDate();
        setAvailableDays(DAYS.slice(0, daysInMonth));
    }, [value.month, value.year]);

    const handleValueChange = (field: "day" | "month" | "year", newValue: number) => {
        if (setValue) setValue({ ...value, [field]: newValue });
    };

    React.useEffect(() => {
        if (value && (value.day || value.month || value.year)) {
            setFocused(true);
        }
    }, [value]);

    return (
        <View style={styles.container}>
            <View style={[styles.formcontainer, isFocused && styles.focus, error && styles.error]}>
                {isFocused && (
                    <Text
                        style={[
                        styles.label,
                        { color: error ? "red" : "#537FE7", 
                            backgroundColor: colorScheme === "dark" ? "#151718" : "#F6F6F6",
                        }
                        ]}
                    >
                        Birth Date
                    </Text>
                )}

                <Ionicons
                    name="calendar-outline"
                    style={[styles.iconHead, error && styles.error, { color: colorScheme === "dark" ? "#D3D3D3" : "#545454" }]}
                />

                <Dropdown
                    data={months}
                    value={value.month}
                    onChange={(item) => handleValueChange("month", item.value)}
                    style={styles.dropdown}
                    placeholder="Month"
                    labelField="label"
                    valueField="value"
                    placeholderStyle={{ color: colorScheme === "dark" ? "#D3D3D3" : "#545454" }}
                    onFocus={() => {
                        setFocused(true);
                    }}
                    onBlur={() => setFocused(false)}
                    itemTextStyle={{
                        fontFamily: "CeraPro",
                        color: colorScheme === "dark" ? "#D3D3D3" : "#545454"
                    }}
                    containerStyle={{
                        backgroundColor: colorScheme === "dark" ? "#151718" : "#F6F6F6",
                    }}
                    fontFamily="CeraPro"
                    selectedTextStyle={{
                        fontFamily: "CeraPro",
                        fontSize: 16,
                        color: colorScheme === "dark" ? "#D3D3D3" : "#545454",
                        textAlign: "center",
                    }}
                    activeColor={colorScheme === "dark" ? "#545454" : "#D3D3D3"}
                />

                <Dropdown
                    data={availableDays.map((day) => ({ label: day.toString(), value: day }))}
                    value={value.day}
                    onChange={(item) => handleValueChange("day", item.value)}
                    style={styles.dropdown}
                    placeholder="Day"
                    labelField="label"
                    valueField="value"
                    placeholderStyle={{ color: colorScheme === "dark" ? "#D3D3D3" : "#545454" }}
                    activeColor={colorScheme === "dark" ? "#545454" : "#D3D3D3"}
                    onFocus={() => {
                        setFocused(true);
                    }}
                    onBlur={() => setFocused(false)}
                    itemTextStyle={{
                        fontFamily: "CeraPro",
                        color: colorScheme === "dark" ? "#D3D3D3" : "#545454"
                    }}
                    containerStyle={{
                        backgroundColor: colorScheme === "dark" ? "#151718" : "#F6F6F6",
                    }}
                    fontFamily="CeraPro"
                    selectedTextStyle={{
                        fontFamily: "CeraPro",
                        fontSize: 16,
                        color: colorScheme === "dark" ? "#D3D3D3" : "#545454",
                        textAlign: "center",
                    }}
                />

                <Dropdown
                    data={YEARS.map((year) => ({ label: year.toString(), value: year }))}
                    value={value.year}
                    onChange={(item) => handleValueChange("year", item.value)}
                    style={styles.dropdown}
                    placeholder="Year"
                    activeColor={colorScheme === "dark" ? "#545454" : "#D3D3D3"}
                    labelField="label"
                    valueField="value"
                    placeholderStyle={{ color: colorScheme === "dark" ? "#D3D3D3" : "#545454" }}
                    onFocus={() => {
                        setFocused(true);
                    }}
                    onBlur={() => setFocused(false)}
                    itemTextStyle={{
                        fontFamily: "CeraPro",
                        color: colorScheme === "dark" ? "#D3D3D3" : "#545454"
                    }}
                    containerStyle={{
                        backgroundColor: colorScheme === "dark" ? "#151718" : "#F6F6F6",
                    }}
                    fontFamily="CeraPro"
                    selectedTextStyle={{
                        fontFamily: "CeraPro",
                        fontSize: 16,
                        textAlign: "center",
                        color: colorScheme === "dark" ? "#D3D3D3" : "#545454"
                    }}
                />
                
            </View>

        {error && <Text style={styles.errmsg}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "95%",
        marginBottom: 5,
    },
    back:{
        marginVertical: 20,
    },
    backBtn:{
        justifyContent: "center",
        alignContent: "center"
    },
    formcontainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#717171",
        borderRadius: 5,
        height: 47,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: "CeraPro",
    },
    iconHead: {
        fontSize: 24,
        padding: 10,
    },
    icon: {
        fontSize: 24,
        position: "absolute",
        top: 0,
        right: 0,
        marginTop: 10,
        marginRight: 10,
    },
    dropdown: {
        flex: 1,
        borderColor: "transparent",
    },
    focus: {
        borderColor: "#0B60B0",
        borderWidth: 2,
    },
    error: {
        borderColor: "red",
    },
    errmsg: {
        position: "absolute",
        marginVertical: 50,
        marginLeft: 5,
        color: "red",
        fontSize: 12,
        fontFamily: "CeraPro",
    },
    label: {
        position: "absolute",
        backgroundColor: "white",
        left: 12,
        top: -10,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
        fontFamily: "CeraPro",
        color: "#537FE7",
    },
});

export default BirthdateSelector;
