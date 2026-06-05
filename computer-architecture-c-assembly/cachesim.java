/*Simulator of a single-level cache and the memory underneath it.
 The simulator takes the following input parameters on the command line: 
 name of the file holding the loads and stores, cache size in kB, associativity, 
 and the block size in bytes. The replacement policy is always LRU.
The cache is write-through and write-no-allocate with 24 bit addresses*/

import java.util.*;

import java.io.*;

public class cachesim {
    public static int globalcounter=0;
    static String [] memory= new String [1<<24];
    
    public class cache{
    
    public int cacheSize;
    public int assoc;
    public int blockSize;
    public int indexBits;
    public int tagBits;
    public int offBits;
    public int numSets;
    public HashMap<Integer, ArrayList<Block>> cacheData= new HashMap<>();

    public cache(int cS, int aSize, int bS)
    { 
        for(int i=0;i<memory.length;i++)
        {
            memory[i]="00";
        }
        cacheSize= 1024*cS;
        assoc=aSize;
        blockSize=bS;
        numSets=(cacheSize/bS)/assoc;
        offBits=log2(bS);
        indexBits=log2(numSets);
        tagBits=24-offBits-indexBits;

    }
    
    }
    public class Block{

        public int offset;
        public int index;
        public int tag;
        public boolean inCache;
        public int counter;

        public Block(int address,cache cache){
            inCache=false;
            offset= address & ((1<<cache.offBits)-1);
            index=address>>cache.offBits & ((1<<cache.indexBits)-1);
            tag= address>>(cache.offBits+cache.indexBits);
            counter=-1;
        }
        
    }

    public static void store( int addr, int access, cache c, String data){
        cachesim obj=new cachesim();
        Block b=obj.new Block(addr, c);
        int j=addr;
        for(int i=0;i<data.length()-1;i+=2)
        {
            memory[j]=data.substring(i,i+2);
            j++;
        }
        if(c.cacheData.containsKey(b.index))
        {
            ArrayList<Block> values= c.cacheData.get(b.index);
            for(int i=0;i<values.size();i++)
            {
                if(values.get(i).tag==b.tag)
                {
                    values.get(i).counter=globalcounter;
                    b.inCache=true;
                }
            }
        }
        if(b.inCache)
        {
            System.out.println("store 0x"+Integer.toHexString(addr)+" hit");
        }
        else{

            System.out.println("store 0x"+Integer.toHexString(addr)+" miss");
        }

        globalcounter ++;
    }
    public static void load(int addr, int access, cache c)
    {
        cachesim obj=new cachesim();
        Block b= obj.new Block(addr,c);
        int j=addr;
        String ans="";
        for(int i=0;i<access;i++)
        {
            ans+=memory[j];
            j++;
        }
            //index not in cache yet
            if(!c.cacheData.containsKey(b.index))
            {
               b.counter=globalcounter;
               b.inCache=true;
               c.cacheData.put(b.index, new ArrayList<Block>());
                c.cacheData.get(b.index).add(b);
                System.out.println("load 0x"+Integer.toHexString(addr)+" miss "+ans);
                globalcounter ++;
                return;

            }
            else//index in cache, check if tag is there already or not
            {
                b.counter=globalcounter;
                List<Block> val=c.cacheData.get(b.index);
                for(int i=0;i<val.size();i++)
                {
                if(val.get(i).tag==b.tag)//tag already found
                {
                    b.inCache=true;
                    val.get(i).counter=globalcounter;
                    System.out.println("load 0x"+Integer.toHexString(addr)+" hit "+ans);
                    globalcounter ++;
                    return;
                }
                }
                int size= val.size();//insert tag but check size
                if(size==c.assoc)
                {
                    int min=val.get(0).counter;
                    int point=0;
                    for(int i=0;i<size;i++)
                    {
                        if(val.get(i).counter<min)
                        {
                            min=val.get(i).counter;
                            point=i;
                        }
                    }
                    val.get(point).inCache=false;
                    val.remove(point);
                }
                b.inCache=true;
                val.add(b);
            }
            System.out.println("load 0x"+Integer.toHexString(addr)+" miss "+ans);
            globalcounter ++;
        }


    int log2(int n) {
    int r = 0;
    while ((n >>= 1) != 0) r++;
    return r;
    }
    public static void main(String[] args) throws FileNotFoundException, IOException
    {
        BufferedReader buffer = new BufferedReader(new FileReader(args[0]));
		int cS = Integer.parseInt(args[1]);
		int a = Integer.parseInt(args[2]);
		int bS = Integer.parseInt(args[3]);

        cachesim obj=new cachesim();
        cachesim.cache c= obj.new cache(cS,a,bS);
        String line;
        while ((line = buffer.readLine()) != null) 
        {
            String[] words = line.split(" ");
            String instruction = words[0];
            int addy = Integer.parseInt(words[1].substring(2),16);
            int accessSize = Integer.parseInt(words[2]);
            if(instruction.equals("store"))
            {
                String data = words[3];
                store(addy,accessSize,c,data);
            }
            else
            {
                load(addy, accessSize,c);
            }
        }
       buffer.close();
        System.exit(0);
    }
}
