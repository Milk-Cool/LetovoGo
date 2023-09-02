import { useState } from "react";
import { StyleSheet, Text, View,
  TextInput, Pressable, Alert, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Letovo from "letovo-api";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

const ACCENT_COLOR = "#88f";
const SECONDARY_COLOR = "#888";
const BUTTON_TEXT_COLOR = "#fff";

let loggedIn = false;

const InputField = props => <TextInput
  style={styles.text_field}
  placeholder={props.placeholder}
  onChangeText={props.onChangeText}
  secureTextEntry={props.isPassword}
  autoComplete={props.autoComplete}
/>

const Tab = createBottomTabNavigator();

export default function App() {
  const todayDate = new Date();
  const today = todayDate.toISOString().split("T")[0];
  let days = [];
  for(let i = 1; i <= 7; i++)
    days.push((new Date(new Date() - (todayDate.getDay() - i) * 1000 * 60 * 60 * 24)).toISOString().split("T")[0]);

  const [schedule, setSchedule] = useState([]);
  const [selDay, setSelDay] = useState(today);
  const [plan, setPlan] = useState({});
  
  const generateTable = () => {
    let col = [];
    for(let i of schedule) {
      if(i.date != selDay) continue;
      if(i.schedules.length != 0)
        col.push(
          <View>
            <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{"(" + i.period_start + " - " + i.period_end + ") " + i.schedules[0].group.subject.subject_name_eng + "\n"}</Text>
            <Text style={styles.buttonText}>{i.schedules[0].group.group_name + " " + i.schedules[0].room.room_name + "\n"}</Text>
            <Text style={{ fontSize: 8, ...styles.buttonText }}>{`${i.period_name} (${i.period_shortname})`}</Text>
          </View>
        );
    }
    return col;
  }
  const generatePlan = () => {
    let col = [];
    for(let i of plan.student_curriculum) {
      col.push(
        <View>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{i.group.group_name + "\n"}</Text>
          <Text style={styles.buttonText}>{i.group.subject.subject_name_eng + "\n"}</Text>
          <Text style={{ fontSize: 8, ...styles.buttonText }}>{`${i.group.group_teachers[0].teacher.teacher_surname_eng} ${i.group.group_teachers[0].teacher.teacher_name_eng} ${i.group.group_teachers[0].teacher.teacher_fath_eng}`}</Text>
          <Text style={{ fontSize: 8, ...styles.buttonText }}>{`${i.group.group_teachers[0].teacher.teacher_mail}`}</Text>
        </View>
      );
    }
    return col;
  }

  const LoginScreen = props => {
    const [uname, setUname] = useState("");
    const [pwd, setPwd] = useState("");
    let user;

    const saveLoginPassword = async () => {
      await AsyncStorage.setItem("uname", uname);
      await AsyncStorage.setItem("pwd", pwd);
    }
    const loadLoginPassword = async () => {
      const loadedUname = await AsyncStorage.getItem("uname");
      const loadedPwd = await AsyncStorage.getItem("pwd");
      return [loadedUname, loadedPwd];
    }
    const checkLoginPassword = async () => {
      const [loadedUname, loadedPwd] = await loadLoginPassword();
      return loadedUname !== null && loadedPwd !== null && loadedUname !== "" && loadedPwd !== "";
    }
    const login = async (silent) => {
      if(await checkLoginPassword() && uname == "" && pwd == "") {
        user = new Letovo(...(await loadLoginPassword()));
      } else {
        if(uname == "")
          return Alert.alert("You did not enter a username!", "Please enter your school username.");
        if(pwd == "")
          return Alert.alert("You did not enter a password!", "Please enter your school password.");
        await saveLoginPassword();
        user = new Letovo(uname, pwd);
      }
      try {
        await user.login();
        if(silent) props.navigation.navigate("Schedule");
        else Alert.alert("Success!", "You have successfully logged in.");
        setSchedule(await user.weekSchedule());
        setPlan(await user.plan());
      } catch(_) {
        Alert.alert("Wrong username/password!", "Please enter a valid username/password pair.");
      }
    }
    (async () => {
      if(!loggedIn && await checkLoginPassword()) {
        loggedIn = true;
        await login(true);
      }
    })();
    return (
      <View style={styles.container}>
        <InputField
          placeholder="Username"
          onChangeText={setUname}
          autoComplete="username"
        />
        <InputField
          placeholder="Password"
          onChangeText={setPwd}
          isPassword={true}
          autoComplete="current-password"
        />
        <Pressable
          style={styles.button}
          onPress={() => login(false)}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </Pressable>
      </View>
    )
  };

  const ScheduleList = ({ data }) => {
    const schd = data.map(x => <View style={styles.schedule_item}>
      {x}
    </View>);
    return <View>{schd}</View>;
  };

  const ScheduleScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Picker
          style={{ width: 300 }}
          selectedValue={selDay}
          onValueChange={setSelDay}
        >
          <Picker.Item label="Monday" value={days[0]} />
          <Picker.Item label="Tuesday" value={days[1]} />
          <Picker.Item label="Wednesday" value={days[2]} />
          <Picker.Item label="Thursday" value={days[3]} />
          <Picker.Item label="Friday" value={days[4]} />
          <Picker.Item label="Saturday" value={days[5]} />
          <Picker.Item label="Sunday" value={days[6]} />
        </Picker>
        <ScheduleList data={generateTable()} />
      </ScrollView>
    );
  };

  const GroupsScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generatePlan()} />
      </ScrollView>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Log in") {
              iconName = focused
                ? "log-in"
                : "log-in-outline";
            } else if (route.name === "Schedule") {
              iconName = focused
                ? "time"
                : "time-outline";
            } else if (route.name === "Groups") {
              iconName = focused
                ? "people"
                : "people-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: ACCENT_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        })}>
        <Tab.Screen name="Log in" component={LoginScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Groups" component={GroupsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text_field: {
    margin: 15,
    padding: 15,
    borderColor: ACCENT_COLOR,
    borderWidth: 3,
    borderRadius: 5,
    minWidth: 250,
  },
  button: {
    margin: 15,
    padding: 15,
    backgroundColor: ACCENT_COLOR,
    alignItems: "center",
    borderRadius: 5,
    minWidth: 250,
    elevation: 3,
  },
  buttonText: {
    color: BUTTON_TEXT_COLOR,
  },
  schedule_item: {
    margin: 15,
    padding: 15,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 5,
    minWidth: 250,
    elevation: 3,
  }
});
