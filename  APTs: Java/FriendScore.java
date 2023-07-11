  /*Person A is called a 2-friend of another person B if they are friends with 
  each other or if there exists some person C who is a friend of both A and B. 
  Given a String[] friends, where the j-th character of the i-th element is 
  'Y' if person i and person j are friends, and 'N' otherwise, return the number 
  of 2-friends of the most popular person in this social network.*/
  
  import java.util.*;
  public class FriendScore {
    private TreeMap<Integer,List<Character>> ref=new TreeMap<>();
    private TreeMap<Integer, HashSet<Integer>> first=new TreeMap<>();
    private TreeMap<Integer, HashSet<Integer>> sec=new TreeMap<>();

    public int highestScore(String[] friends) {
        maker(friends);
        fmaker();
        smaker();
        int max=0;
        for(int k: sec.keySet())
        {
            if(sec.get(k).size()>max)
            {
                max=sec.get(k).size()-1;
            }
        }
       return max;
     }

    public void fmaker()
    {
        for(int me=0;me<ref.size();me++)
        {
            first.putIfAbsent(me, new HashSet<Integer>());
            for(int he=0; he<ref.size();he++)
            {
                if(ref.get(he).get(me)=='Y')
                {
                    HashSet<Integer> s=first.get(me);
                    
                    s.add(he);
                    first.put(me,s);
                }
             
            }
    }
            

    }
    public void smaker()
    {
        for(int me=0;me<first.size();me++)
        {
            sec.putIfAbsent(me, new HashSet<Integer>());
            for(int he: first.get(me))
            {
                sec.get(me).addAll(first.get(me));
                sec.get(me).addAll(first.get(he));
            }
        }
    }
    public void maker(String [] friends)
    {
        for(int i =0;i<friends.length;i++)
        {
          char []c= friends[i].toCharArray();
          List<Character> list= new ArrayList<>();
          for(char x:c)
          {
            list.add(x);
          }
          ref.put(i, list);
        }
        
    }
  }

