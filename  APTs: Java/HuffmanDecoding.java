/* Given a String archive and a String[] dictionary.
The i-th element of dictionary will be the bit string 
representation of the i-th uppercase letter. Decode archive 
using dictionary and return the result as a single String.*/

import java.util.*;
public class HuffmanDecoding {
    
    public String decode(String archive, String[] dictionary) {
        HashMap<String, Character> map=setter(dictionary);
        String ans="";
        int j=0;
        for(int i=j;i<=archive.length();i++)
        {
            if(map.containsKey(archive.substring(j,i)))
            {
                ans+=map.get(archive.substring(j,i));
                j=i;
            }
        }
        return ans;
    }
    public HashMap<String, Character> setter(String[]dic)
    {
        HashMap<String, Character> map=new HashMap<>();
        char val='A';
        for(String s:dic)
        {
            map.putIfAbsent(s,val);
            val++;
        }
        return map;

    }
 }