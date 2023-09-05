import "react-native-gesture-handler";
import { useState } from "react";
import { StyleSheet, Text, View,
  TextInput, Pressable, Alert, ScrollView,
  TouchableHighlight, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Letovo from "letovo-api";
import { Link, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { createStackNavigator } from "@react-navigation/stack";
import * as Application from "expo-application";

const ACCENT_COLOR = "#88f";
const RED_ACCENT_COLOR = "#f88";
const SECONDARY_COLOR = "#888";
const BUTTON_TEXT_COLOR = "#fff";

let loggedIn = false;
let loggingIn = false;

let user = null;

const InputField = props => <TextInput
  style={styles.text_field}
  placeholder={props.placeholder}
  onChangeText={props.onChangeText}
  secureTextEntry={props.isPassword}
  autoComplete={props.autoComplete}
/>

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Date.prototype.getDayMon = function(){
  return [6, 0, 1, 2, 3, 4, 5][this.getDay()];
};

export default function App() {
  const todayDate = new Date();
  const today = todayDate.toISOString().split("T")[0];
  let days = [];
  for(let i = 0; i < 7; i++)
    days.push((new Date(new Date() - (todayDate.getDayMon() - i) * 1000 * 60 * 60 * 24)).toISOString().split("T")[0]);

  const [schedule, setSchedule] = useState([]);
  const [selDay, setSelDay] = useState(today);
  const [selWeek, setSelWeek] = useState("this");
  const [plan, setPlan] = useState({});
  const [homework, setHomework] = useState([]);
  const [homework2, setHomework2] = useState([]);
  const [loggedIn_, setLoggedIn_] = useState(false);
  const [marks, setMarks] = useState([]);
  const [diploma, setDiploma] = useState({});
  const [olympiads, setOlympiads] = useState([]);
  
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
    if(typeof plan.student_curriculum === "undefined") return [];
    let col = [];
    for(let i of plan.student_curriculum) {
      col.push(
        <View>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{i.group.group_name + "\n"}</Text>
          <Text style={styles.buttonText}>{i.group.subject.subject_name_eng + "\n"}</Text>
          <Text style={{ fontSize: 8, ...styles.buttonText }}>{`${i.group.group_teachers[0].teacher.teacher_surname_eng} ${i.group.group_teachers[0].teacher.teacher_name_eng} ${i.group.group_teachers[0].teacher.teacher_fath_eng}`}</Text>
          <TouchableHighlight onPress={() => Linking.openURL("mailto:" + i.group.group_teachers[0].teacher.teacher_mail)}><Text style={{ fontSize: 8, textDecorationLine: "underline", ...styles.buttonText }}>{`${i.group.group_teachers[0].teacher.teacher_mail}`}</Text></TouchableHighlight>
        </View>
      );
    }
    return col;
  }
  const generateHomework = () => {
    let col = [];
    const hw = selWeek == "this" ? homework : homework2; 
    for(let i in hw)
      for(let j of hw[i]) {
        if(j.task == "") continue;
        col.push(
          <View>
            <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{j.name + "\n"}</Text>
            <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{["Monday", "Tuesday", "Wednesday", "Thursday", "Firday", "Saturday", "Sunday"][i] + "\n"}</Text>
            <Text style={styles.buttonText}>{j.task}</Text>
            <Text>{j.link ? <TouchableHighlight onPress={() => Linking.openURL(j.link)}><Text style={{ ...styles.buttonText, textDecorationLine: "underline", fontSize: 30 }}>Link</Text></TouchableHighlight> : <Text style={styles.buttonText}>No link</Text>}</Text>
          </View>
        );
      }
    return col;
  }
  const generateMarks = () => {
    let col = [];
    for(let i of marks) {
      if(i.formative_list.length == 0 && i.summative_list.length == 0 && i.final_mark_list == 0) continue;
      col.push(
        <View>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{"Summatives average: " + i.summative_avg_value}</Text>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{"Formatives average: " + i.formative_avg_value}</Text>
          <Text style={{ fontWeight: "bold", ...styles.buttonText }}>{"Finals average: " + i.result_final_mark}</Text>
          { i.formative_list.map(x => <Pressable onPress={() => Alert.alert(x.lesson_thema, x.created_at)} style={styles.invertedSchedule_item}><Text style={styles.invertedButtonText}>{(x.mark_criterion ?? "F") + " " + x.mark_value}</Text></Pressable>) }
          { i.summative_list.map(x => <Pressable onPress={() => Alert.alert(x.lesson_thema, x.created_at)} style={styles.invertedSchedule_item}><Text style={styles.invertedButtonText}>{(x.mark_criterion ?? "F") + " " + x.mark_value}</Text></Pressable>) }
          { i.final_mark_list.map(x => <Pressable onPress={() => Alert.alert(x.lesson_thema, x.created_at)} style={styles.invertedSchedule_item}><Text style={styles.invertedButtonText}>{(x.mark_criterion ?? "F") + " " + x.mark_value}</Text></Pressable>) }
        </View>
      );
    }
    return col;
  }
  const generateDiploma = () => {
    if(typeof diploma.diploma_letovo_table === "undefined") return [];
    let col = [];
    for(let i in diploma.diploma_letovo_table) {
      const I = diploma.diploma_letovo_table[i];
      const bronze = I["Бронзовые"];
      const silver = I["Серебряные"];
      const golden = I["Золотые"];
      if(bronze.score + silver.score + golden.score == 0) continue;
      const mapF1 = x => <Pressable onPress={() => Alert.alert(x.activity.activity_name, x.activity.activity_end)} style={{ ...styles.invertedSchedule_item, "alignSelf": "stretch" }}><Text style={styles.invertedButtonText}>{x.activity.activity_name}</Text></Pressable>;
      const mapF2 = x => <Pressable onPress={() => Alert.alert(x.group_name, x.year.year_start + "-" + x.year.year_end)} style={{ ...styles.invertedSchedule_item, "alignSelf": "stretch" }}><Text style={styles.invertedButtonText}>{x.group_name}</Text></Pressable>;
      const mapF3 = x => <Pressable onPress={() => Alert.alert(x.olimpiada.olimp_name, x.olimpiada_result + " " + x.olimpiada.year.year_start + "-" + x.olimpiada.year.year_end)} style={{ ...styles.invertedSchedule_item, "alignSelf": "stretch" }}><Text style={styles.invertedButtonText}>{x.olimpiada.olimp_name}</Text></Pressable>;
      col.push(
        <View>
          <Text style={{ ...styles.buttonText, fontSize: 25, fontWeight: "bold" }}>{i}</Text>
          {
            bronze.score
            ? <View>
              <Text style={{ fontWeight: "bold", ...styles.buttonText }}>Bronze: {bronze.score}</Text>
              { bronze.received_for.activities.map(mapF1) }
              { bronze.received_for.courses.map(mapF2) }
              { bronze.received_for.olimpiads.map(mapF3) }
              { /*bronze.received_for.projects.map(mapF)*/ }
            </View>
            : ""
          }
          {
            silver.score
            ? <View>
              <Text style={{ fontWeight: "bold", ...styles.buttonText }}>Silver: {silver.score}</Text>
              { silver.received_for.activities.map(mapF1) }
              { silver.received_for.courses.map(mapF2) }
              { silver.received_for.olimpiads.map(mapF3) }
              { /*silver.received_for.projects.map(mapF)*/ }
            </View>
            : ""
          }
          {
            golden.score
            ? <View>
              <Text style={{ fontWeight: "bold", ...styles.buttonText }}>Golden: {golden.score}</Text>
              { golden.received_for.activities.map(mapF1) }
              { golden.received_for.courses.map(mapF2) }
              { golden.received_for.olimpiads.map(mapF) }
              { /*golden.received_for.projects.map(mapF)*/ }
            </View>
            : ""
          }
        </View>
      );
    }
    return col;
  }
  const generateOlympiads = () => {
    let col = [];
    for(let i of olympiads) {
      col.push(
        <Pressable onPress={() => Alert.alert(i.olimpiada.olimp_name, i.olimpiada_result + "\n" + i.subject.subject_name_eng + "\n" + i.activity_results.map(x => x.letovodiploma_criterion.diplom_level + " " + x.letovodiploma_criterion.diplom_score).join("\n"))}>
          <Text style={{ ...styles.buttonText, fontWeight: "bold", fontSize: 25 }}>{i.olimpiada.olimp_name}</Text>
          <Text style={styles.buttonText}>{i.olimpiada.olimp_start + " - " + i.olimpiada.olimp_end}</Text>
        </Pressable>
      );
    }
    return col;
  }

  const err = (cause, error) => Alert.alert("Error: " + cause, error);

  const LoginScreen = props => {
    const [uname, setUname] = useState("");
    const [pwd, setPwd] = useState("");

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
      loggingIn = true;
      try {
        await user.login();
        await user.loginOld();
        if(!silent) Alert.alert("Success!", "You have successfully logged in.");
        user.weekSchedule().then(setSchedule).catch(e => err("Schedule", e));
        user.plan().then(setPlan).catch(e => err("Plan", e));
        user.homework().then(setHomework).catch(e => err("Homework this week", e));
        user.homework(new Date(+(new Date()) + 1000 * 60 * 60 * 24 * 7)).then(setHomework2).catch(e => err("Homework next week", e));
        user.marks().then(setMarks).catch(e => err("Marks", e));
        user.diploma().then(setDiploma).catch(e => err("Diploma", e));
        user.olympiads().then(setOlympiads).catch(e => err("Olympiads", e));
        setLoggedIn_(true);
        loggingIn = false;
      } catch(_) {
        Alert.alert("Wrong username/password!", "Please enter a valid username/password pair.");
        loggingIn = false;
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
          placeholder="Username (without @student...)"
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
          onPress={() => loggingIn ? null : login(false)}
        >
          <Text style={styles.buttonText}>{loggingIn ? "Logging in..." : "Log in"}</Text>
        </Pressable>
      </View>
    )
  };
  const LogoutScreen = () => {
    const logout = async () => {
      await AsyncStorage.setItem("uname", "");
      await AsyncStorage.setItem("pwd", "");
      setSchedule([]);
      setPlan({});
      setHomework([]);
      setHomework2([]);
      setMarks([]);
      setDiploma({});
      setOlympiads([]);
      setLoggedIn_(false);
      user = null;
    }
    return (
      <View style={styles.container}>
        <Pressable
          style={{ ...styles.button, backgroundColor: RED_ACCENT_COLOR }}
          onPress={() => logout()}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>
        <Text style={{ maxWidth: 300, textAlign: "center" }}>Logging out will delete your login credentials from your device and you will not be able to log in automatically.</Text>
      </View>
    );
  }

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
          style={{ alignSelf: "stretch" }}
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
  };

  const HomeworkScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Picker
          style={{ alignSelf: "stretch" }}
          selectedValue={selWeek}
          onValueChange={setSelWeek}
        >
          <Picker.Item label="This week" value="this" />
          <Picker.Item label="Next week" value="next" />
        </Picker>
        <ScheduleList data={generateHomework()} />
      </ScrollView>
    );
  }

  const MarksScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generateMarks()} />
      </ScrollView>
    );
  }
  
  const DiplomaScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generateDiploma()} />
      </ScrollView>
    );
  }

  const OlympiadsScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <ScheduleList data={generateOlympiads()} />
      </ScrollView>
    )
  }
  
  const InfoScreen = () => {
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Text style={{ fontSize: 25 }}>{Application.applicationName}</Text>
        <Text>{Application.nativeApplicationVersion}</Text>
        <Text>{Application.applicationId}</Text>
        <Text>{Application.nativeBuildVersion}</Text>
        <Text>Made by Milk_Cool with ❤️</Text>
      </ScrollView>
    )
  }

  const OtherChooserScreen = ({ navigation }) => {
    const Option = params => {
      return <Pressable
        style={styles.option}
        onPress={() => navigation.navigate(params.screen)}
      >
        <Text style={styles.optionText}>{params.name}</Text>
        <Ionicons style={styles.optionArrow} name="chevron-forward-outline" size={22} />
      </Pressable>
    }
    return (
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignContent: "center" }}>
        <Option screen="Groups" name="Groups" />
        <Option screen="Letovo diploma" name="Letovo diploma" />
        <Option screen="Olympiads" name="Olympiads list" />
        <Option screen="Info" name="App info" />
      </ScrollView>
    )
  }

  const OtherScreen = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Other options" component={OtherChooserScreen} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="Letovo diploma" component={DiplomaScreen} />
        <Stack.Screen name="Olympiads" component={OlympiadsScreen} />
        <Stack.Screen name="Info" component={InfoScreen} />
      </Stack.Navigator>
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
            } else if (route.name === "Log out") {
              iconName = focused
                ? "log-out"
                : "log-out-outline";
            } else if (route.name === "Schedule") {
              iconName = focused
                ? "time"
                : "time-outline";
            } else if (route.name === "Marks") {
              iconName = focused
                ? "school"
                : "school-outline";
            } else if (route.name === "Homework") {
              iconName = focused
                ? "document"
                : "document-outline";
            } else if (route.name === "Other") {
              iconName = focused
                ? "ellipsis-horizontal"
                : "ellipsis-horizontal-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: ACCENT_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        })}>
        <Tab.Screen name={loggedIn_ ? "Log out" : "Log in"} component={loggedIn_ ? LogoutScreen : LoginScreen} />
        <Tab.Screen name="Schedule" component={ScheduleScreen} />
        <Tab.Screen name="Marks" component={MarksScreen} />
        <Tab.Screen name="Homework" component={HomeworkScreen} />
        <Tab.Screen name="Other" component={OtherScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
  /*{loggedIn_
    ? <Tab.Screen name="Log out" component={LogoutScreen} />
    : <Tab.Screen name="Log in" component={LoginScreen} />
  }*/
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
  invertedSchedule_item: {
    margin: 15,
    padding: 15,
    backgroundColor: BUTTON_TEXT_COLOR,
    borderRadius: 5,
    alignSelf: "flex-start",
    elevation: 3,
  },
  invertedButtonText: {
    color: ACCENT_COLOR,
  },
  schedule_item: {
    margin: 15,
    padding: 15,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 5,
    minWidth: 250,
    elevation: 3,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1.5,
    borderBottomColor: SECONDARY_COLOR,
    flexDirection: "row",
  },
  optionText: {
    fontSize: 18,
    color: ACCENT_COLOR,
    flex: 1,
    justifyContent: "flex-start"
  },
  optionArrow: {
    color: ACCENT_COLOR,
    justifyContent: "flex-end"
  }
});